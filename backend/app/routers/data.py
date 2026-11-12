from datetime import date
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import extract
from app.database import get_db
from app.models import User, Category, Transaction, Budget
from app.schemas import CategoryOut, TransactionCreate, TransactionOut, BudgetCreate, BudgetOut
from app.security import get_current_user

router = APIRouter(prefix="/api", tags=["SmartSpend"])

@router.get("/categories", response_model=list[CategoryOut])
def categories(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Category).order_by(Category.kind, Category.name).all()

def owned_transaction(db: Session, transaction_id: int, user_id: int):
    item = db.query(Transaction).options(joinedload(Transaction.category)).filter(
        Transaction.id == transaction_id, Transaction.user_id == user_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return item

@router.get("/transactions", response_model=list[TransactionOut])
def list_transactions(
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=2020, le=2100),
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    q = db.query(Transaction).options(joinedload(Transaction.category)).filter(Transaction.user_id == user.id)
    if month: q = q.filter(extract("month", Transaction.transaction_date) == month)
    if year: q = q.filter(extract("year", Transaction.transaction_date) == year)
    return q.order_by(Transaction.transaction_date.desc(), Transaction.id.desc()).all()

@router.post("/transactions", response_model=TransactionOut, status_code=201)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    category = db.get(Category, payload.category_id)
    if not category or category.kind != payload.kind:
        raise HTTPException(status_code=400, detail="Choose a category matching the transaction type")
    item = Transaction(user_id=user.id, **payload.model_dump())
    db.add(item); db.commit()
    return owned_transaction(db, item.id, user.id)

@router.put("/transactions/{transaction_id}", response_model=TransactionOut)
def update_transaction(transaction_id: int, payload: TransactionCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = owned_transaction(db, transaction_id, user.id)
    category = db.get(Category, payload.category_id)
    if not category or category.kind != payload.kind:
        raise HTTPException(status_code=400, detail="Choose a category matching the transaction type")
    for key, value in payload.model_dump().items(): setattr(item, key, value)
    db.commit()
    return owned_transaction(db, item.id, user.id)

@router.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = owned_transaction(db, transaction_id, user.id)
    db.delete(item); db.commit()
    return {"message": "Transaction deleted"}

@router.get("/budgets", response_model=list[BudgetOut])
def list_budgets(month: int | None = None, year: int | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Budget).options(joinedload(Budget.category)).filter(Budget.user_id == user.id)
    if month: q = q.filter(Budget.month == month)
    if year: q = q.filter(Budget.year == year)
    return q.order_by(Budget.year.desc(), Budget.month.desc()).all()

@router.post("/budgets", response_model=BudgetOut, status_code=201)
def upsert_budget(payload: BudgetCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    category = db.get(Category, payload.category_id)
    if not category or category.kind != "expense":
        raise HTTPException(status_code=400, detail="Budget category must be an expense category")
    item = db.query(Budget).filter_by(user_id=user.id, category_id=payload.category_id, month=payload.month, year=payload.year).first()
    if item: item.amount = payload.amount
    else:
        item = Budget(user_id=user.id, **payload.model_dump()); db.add(item)
    db.commit(); db.refresh(item)
    return db.query(Budget).options(joinedload(Budget.category)).get(item.id)

@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    today = date.today()
    rows = db.query(Transaction).options(joinedload(Transaction.category)).filter(
        Transaction.user_id == user.id,
        extract("month", Transaction.transaction_date) == today.month,
        extract("year", Transaction.transaction_date) == today.year,
    ).all()
    income = sum((r.amount for r in rows if r.kind == "income"), Decimal("0"))
    expenses = sum((r.amount for r in rows if r.kind == "expense"), Decimal("0"))
    category_totals = {}
    for r in rows:
        if r.kind == "expense":
            category_totals[r.category.name] = category_totals.get(r.category.name, Decimal("0")) + r.amount
    budgets = db.query(Budget).filter_by(user_id=user.id, month=today.month, year=today.year).all()
    budget_total = sum((b.amount for b in budgets), Decimal("0"))
    recent = db.query(Transaction).options(joinedload(Transaction.category)).filter(
        Transaction.user_id == user.id
    ).order_by(Transaction.transaction_date.desc(), Transaction.id.desc()).limit(6).all()
    insights = []
    if budget_total and expenses > budget_total:
        insights.append(f"You have exceeded your combined monthly budgets by ₹{expenses - budget_total:.2f}.")
    elif budget_total and expenses >= budget_total * Decimal("0.8"):
        insights.append("You have used at least 80% of your combined monthly budgets. Keep an eye on upcoming expenses.")
    if category_totals:
        top = max(category_totals, key=category_totals.get)
        insights.append(f"{top} is your highest spending category this month.")
    if not rows:
        insights.append("Add your first transaction to start seeing your spending insights.")
    return {
        "month": today.month, "year": today.year,
        "income": income, "expenses": expenses, "balance": income - expenses,
        "budget_total": budget_total, "category_totals": [
            {"category": k, "amount": v} for k, v in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
        ],
        "recent_transactions": recent, "insights": insights,
    }
