from datetime import datetime, timedelta, timezone
from typing import Union
from jose import jwt
from passlib.context import CryptContext

# १. कन्फिगरेसनहरू
SECRET_KEY = "SUPER_SECRET_KEY_FOR_MVP_MARKETPLACE_DONT_USE_IN_PRODUCTION"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# २. Passlib को प्रयोग गरेर Bcrypt कन्फिगर गर्ने
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    यसले पासवर्डलाई सुरक्षित रूपमा Bcrypt प्रयोग गरेर ह्यास गर्छ।
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    प्लेन पासवर्ड र ह्यास गरिएको पासवर्ड मिलेको छ कि छैन भनेर जाँच्छ।
    """
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt