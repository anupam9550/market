from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# सामान थप्दा फ्रन्टइन्डबाट चाहिने डेटा
class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    stock: int
    image_url: Optional[str] = None

# ब्राउजर वा एपमा सामान देखाउँदा फर्काइने डेटा
class ProductResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    price: float
    stock: int
    image_url: Optional[str]
    seller_id: int
    created_at: datetime

    class Config:
        from_attributes = True