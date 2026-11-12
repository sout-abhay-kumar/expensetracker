from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine, SessionLocal
from app import models
from app.routers import auth, data

DEFAULT_CATEGORIES = [
    ("Food", "expense"), ("Transport", "expense"), ("Shopping", "expense"),
    ("Bills", "expense"), ("Health", "expense"), ("Education", "expense"),
    ("Entertainment", "expense"), ("Other", "expense"),
    ("Salary", "income"), ("Freelance", "income"), ("Investment", "income"), ("Other income", "income"),
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        for name, kind in DEFAULT_CATEGORIES:
            if not db.query(models.Category).filter_by(name=name, kind=kind).first():
                db.add(models.Category(name=name, kind=kind))
        db.commit()
    yield

app = FastAPI(title="SmartSpend API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(data.router)

@app.get("/")
def root():
    return {"message": "SmartSpend API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
