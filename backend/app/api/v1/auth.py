from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token
from app.core.database import get_db

# 'router' लाई main.py ले यही प्रिफिक्समा खोज्नेछ
router = APIRouter(tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # इमेलको दायाँ-बायाँको स्पेस हटाउने र सबै साना अक्षरमा ढाल्ने
    clean_email = user_data.email.lower().strip()
    
    db_user = db.query(User).filter(User.email == clean_email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = hash_password(user_data.password)
    new_user = User(
        email=clean_email,
        password_hash=hashed_pwd,
        full_name=user_data.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    # लगइन गर्दा पनि इमेलको स्पेस हटाउने र साना अक्षरमा ढाल्ने
    clean_email = login_data.email.lower().strip()
    
    user = db.query(User).filter(User.email == clean_email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # यदि युजरको रोल खाली (None) छ भने डिफल्ट 'user' सेट गर्ने ताकि टोकन क्र्यास नहोस्
    user_role = user.role if user.role else "user"
    
    access_token = create_access_token(data={"sub": user.email, "role": user_role})
    return {"access_token": access_token, "token_type": "bearer"}