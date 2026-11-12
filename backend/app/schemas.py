from datetime import date
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field, EmailStr

class GoogleCredential(BaseModel):
    credential: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    picture: str | None = None
    model_config = ConfigDict(from_attributes=True)

class AuthOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class CategoryOut(BaseModel):
    id: int
    name: str
    kind: str
    model_config = ConfigDict(from_attributes=True)

class TransactionCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    amount: Decimal = Field(gt=0, le=999999999)
    kind: str
    category_id: int
    transaction_date: date
    note: str | None = Field(default=None, max_length=500)

class TransactionOut(BaseModel):
    id: int
    title: str
    amount: Decimal
    kind: str
    category_id: int
    category: CategoryOut
    transaction_date: date
    note: str | None
    model_config = ConfigDict(from_attributes=True)

class BudgetCreate(BaseModel):
    category_id: int
    amount: Decimal = Field(gt=0, le=999999999)
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2020, le=2100)

class BudgetOut(BaseModel):
    id: int
    category_id: int
    category: CategoryOut
    amount: Decimal
    month: int
    year: int
    model_config = ConfigDict(from_attributes=True)
