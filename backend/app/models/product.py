from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0, nullable=False)
    image_url = Column(String, nullable=True)
    
    # कुन बिक्रेता (Seller) ले यो सामान राखेको हो, त्यसको ID (Foreign Key)
    seller_id = Column(Integer, ForeignKey("sellers.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship: यसले सामान र बिक्रेतालाई जोड्छ
    seller = relationship("Seller")