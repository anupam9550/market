from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.order import OrderCreate, OrderResponse
from app.models.order import Order
from app.models.product import Product
from app.core.database import get_db

router = APIRouter(prefix="/orders", tags=["Orders"])

# सामान अर्डर गर्ने API
@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    # सामान छ कि छैन र स्टक छ कि छैन चेक गर्ने
    product = db.query(Product).filter(Product.id == order_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < order_data.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock available")

    total = product.price * order_data.quantity

    # स्टक घटाउने
    product.stock -= order_data.quantity

    new_order = Order(
        user_id=2,  # हामीले अघि बनाएको टेस्ट युजर
        product_id=order_data.product_id,
        quantity=order_data.quantity,
        total_price=total
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

# आफ्ना अर्डरहरू हेर्ने API
@router.get("/", response_model=List[OrderResponse])
def get_my_orders(db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.user_id == 2).all()