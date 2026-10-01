from pydantic import BaseModel
from datetime import datetime
from app.models.user import UserRole

class UserCreate(BaseModel):
    email: str        # यहाँ str बनाइयो
    password: str
    full_name: str

class UserResponse(BaseModel):
    id: int
    email: str        # यहाँ str बनाइयो
    full_name: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str        # यहाँ str बनाइयो
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str