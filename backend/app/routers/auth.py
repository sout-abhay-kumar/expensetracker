from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import GoogleCredential, AuthOut, UserOut
from app.security import verify_google_credential, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/google", response_model=AuthOut)
def google_login(payload: GoogleCredential, db: Session = Depends(get_db)):
    info = verify_google_credential(payload.credential)
    google_sub = info["sub"]
    email = info["email"].lower()
    user = db.query(User).filter(User.google_sub == google_sub).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
    if user:
        user.google_sub = google_sub
        user.email = email
        user.name = info.get("name") or user.name
        user.picture = info.get("picture")
    else:
        user = User(
            google_sub=google_sub,
            email=email,
            name=info.get("name") or email.split("@")[0],
            picture=info.get("picture"),
        )
        db.add(user)
    db.commit()
    db.refresh(user)
    return AuthOut(access_token=create_access_token(user.id), user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
