from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.product import ProductCreate, ProductResponse
from app.models.product import Product
from app.core.database import get_db

router = APIRouter(prefix="/products", tags=["Products"])

# १. नयाँ सामान थप्ने API (यहाँ बिक्रेताको ID अस्थायी रूपमा २ राखिएको छ, जुन हामीले अघि बनायौँ)
@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_data: ProductCreate, db: Session = Depends(get_db)):
    new_product = Product(
        title=product_data.title,
        description=product_data.description,
        price=product_data.price,
        stock=product_data.stock,
        image_url=product_data.image_url,
        seller_id=2  # अघि हामीले बनाएको दोस्रो टेस्ट युजर (id: 2) सँग लिंक गर्न
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

# २. बजारमा भएका सबै सामानको लिस्ट हेर्ने API (यसलाई जोसुकैले हेर्न मिल्छ)
@router.get("/", response_model=List[ProductResponse])
def get_all_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products