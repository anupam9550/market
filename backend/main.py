import base64
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Iterator

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
DB_FILE = BASE_DIR / "market.db"
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Anup Mega Mall API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

COUPONS = {"NEPAL10": 0.10, "FESTIVE20": 0.20, "MEGA50": 0.50, "NEPAL50": 0.50}
ALLOWED_STATUSES = {"Pending", "Shipped", "Delivered"}


@contextmanager
def database() -> Iterator[sqlite3.Connection]:
    connection = sqlite3.connect(DB_FILE)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000)
    return f"pbkdf2_sha256${salt}${base64.b64encode(digest).decode()}"


def verify_password(password: str, stored_password: str) -> bool:
    # Allows accounts created by the old SHA-256-only implementation to log in.
    if not stored_password.startswith("pbkdf2_sha256$"):
        return hmac.compare_digest(hashlib.sha256(password.encode()).hexdigest(), stored_password)
    try:
        _, salt, encoded_digest = stored_password.split("$", 2)
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000)
        return hmac.compare_digest(base64.b64encode(actual).decode(), encoded_digest)
    except ValueError:
        return False


def init_db() -> None:
    with database() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                base_price REAL NOT NULL,
                discount_percent INTEGER NOT NULL DEFAULT 0,
                category TEXT NOT NULL,
                images TEXT NOT NULL,
                brand TEXT NOT NULL,
                description TEXT NOT NULL,
                seller_id TEXT NOT NULL,
                rating REAL NOT NULL DEFAULT 4.5,
                review_count INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS product_variants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                size TEXT NOT NULL,
                color TEXT NOT NULL,
                price REAL NOT NULL,
                stock INTEGER NOT NULL CHECK(stock >= 0),
                sku TEXT NOT NULL UNIQUE,
                FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS orders (
                orderId TEXT PRIMARY KEY,
                date TEXT NOT NULL,
                customerName TEXT NOT NULL,
                customerPhone TEXT NOT NULL,
                customerAddress TEXT NOT NULL,
                itemsCount INTEGER NOT NULL,
                shippingFee REAL NOT NULL,
                total REAL NOT NULL,
                paymentMethod TEXT NOT NULL,
                itemsDetails TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Pending'
            );
            CREATE TABLE IF NOT EXISTS wishlist (
                user_id TEXT NOT NULL,
                product_id INTEGER NOT NULL,
                PRIMARY KEY (user_id, product_id),
                FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                user_id TEXT NOT NULL,
                rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
                comment TEXT NOT NULL,
                date TEXT NOT NULL,
                FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS coupons (
                code TEXT PRIMARY KEY,
                discount_percent INTEGER NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS chats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                sender TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
            );
        """)
        for table, column, definition in [
            ("products", "ai_sentiment", "TEXT NOT NULL DEFAULT 'Positive Feedback'"),
            ("product_variants", "image_url", "TEXT"),
            ("orders", "orderNote", "TEXT"),
            ("orders", "giftWrap", "INTEGER NOT NULL DEFAULT 0"),
        ]:
            try:
                conn.execute(f"SELECT {column} FROM {table} LIMIT 1")
            except sqlite3.OperationalError:
                conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")
        conn.executemany("INSERT OR IGNORE INTO coupons (code, discount_percent) VALUES (?, ?)", [("MEGA20", 20), ("WELCOME10", 10)])
        if conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]:
            return
        products = [
            ("Trendy Oversized Summer Hoodie", 45.0, 15, "Clothing", json.dumps(["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80"]), "StreetVibe", "Premium quality streetwear oversized hoodie.", "seller_1", 4.8, 12),
            ("Wireless ANC Headphones Pro", 89.9, 10, "Audio", json.dumps(["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"]), "AeroSound", "High definition wireless noise-cancelling headphones.", "seller_2", 4.7, 8),
            ("Smart Watch Series 9 Ultra", 120.0, 0, "Wearables", json.dumps(["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"]), "ApexTech", "Rugged premium smart watch.", "seller_1", 4.9, 25),
        ]
        conn.executemany("INSERT INTO products (name, base_price, discount_percent, category, images, brand, description, seller_id, rating, review_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", products)
        variants = [
            (1, "M", "Black", 38.25, 15, "HD-BLK-M"), (1, "L", "Black", 38.25, 20, "HD-BLK-L"),
            (1, "M", "White", 40.0, 8, "HD-WHT-M"), (1, "L", "White", 40.0, 0, "HD-WHT-L"),
            (2, "Standard", "Black", 80.91, 15, "HP-ANC-BLK"), (2, "Standard", "Silver", 85.0, 5, "HP-ANC-SLV"),
            (3, "44mm", "Grey", 120.0, 12, "WT-9U-GRY"), (3, "49mm", "Orange", 135.0, 4, "WT-9U-ORN"),
        ]
        conn.executemany("INSERT INTO product_variants (product_id, size, color, price, stock, sku) VALUES (?, ?, ?, ?, ?, ?)", variants)


class UserSignup(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=6, max_length=256)


class UserLogin(BaseModel):
    email: str
    password: str


class VariantCreate(BaseModel):
    size: str = Field(min_length=1)
    color: str = Field(min_length=1)
    price: float = Field(ge=0)
    stock: int = Field(ge=0)
    sku: str = Field(min_length=1)
    image_url: str | None = None


class ProductCreate(BaseModel):
    name: str = Field(min_length=1)
    description: str = ""
    category: str = Field(min_length=1)
    brand: str = Field(min_length=1)
    base_price: float = Field(ge=0)
    discount_percent: int = Field(ge=0, le=100)
    images: list[str] = Field(min_length=1)
    variants: list[VariantCreate] = Field(min_length=1)
    seller_id: str = "admin"
    ai_sentiment: str = "Positive Feedback"


class OrderItem(BaseModel):
    id: int
    variant_sku: str
    quantity: int = Field(gt=0)


class OrderCreateRequest(BaseModel):
    orderId: str
    date: str
    customerName: str
    customerPhone: str
    customerAddress: str
    itemsCount: int
    shippingFee: float = Field(ge=0)
    total: float = Field(ge=0)
    paymentMethod: str
    itemsDetails: str
    status: str = "Pending"
    cartItems: list[OrderItem] = Field(min_length=1)
    orderNote: str = ""
    giftWrap: bool = False


class ReviewCreate(BaseModel):
    user_id: str | None = None
    product_id: int
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1)
    customer_name: str | None = None


class OrderStatusUpdate(BaseModel):
    status: str


@app.get("/")
def read_root():
    return {"message": "Welcome to Anup Mega Mall API Backend!"}


@app.get("/api/v1/validate-coupon")
def validate_coupon(code: str):
    discount = COUPONS.get(code.upper().strip())
    if discount is None:
        raise HTTPException(status_code=400, detail="Invalid coupon code")
    return {"valid": True, "discount": discount}


@app.get("/api/v1/coupons/{code}")
def verify_saved_coupon(code: str):
    with database() as conn:
        row = conn.execute("SELECT discount_percent FROM coupons WHERE code = ? AND is_active = 1", (code.upper().strip(),)).fetchone()
    return {"valid": bool(row), "discount_percent": row["discount_percent"] if row else 0}


@app.post("/api/v1/signup")
def signup(user: UserSignup):
    try:
        with database() as conn:
            conn.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", (user.name.strip(), user.email.lower().strip(), hash_password(user.password)))
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="This email is already registered")
    return {"status": "success", "message": "User registered successfully"}


@app.post("/api/v1/login")
def login(user: UserLogin):
    with database() as conn:
        row = conn.execute("SELECT id, name, email, password FROM users WHERE email = ?", (user.email.lower().strip(),)).fetchone()
    if not row or not verify_password(user.password, row["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"status": "success", "user": {"id": str(row["id"]), "name": row["name"], "email": row["email"]}}


@app.get("/api/v1/products")
def get_products():
    with database() as conn:
        rows = conn.execute("SELECT * FROM products ORDER BY id DESC").fetchall()
        result = []
        for product in rows:
            variants = conn.execute("SELECT size, color, price, stock, sku, image_url FROM product_variants WHERE product_id = ?", (product["id"],)).fetchall()
            try:
                images = json.loads(product["images"])
            except json.JSONDecodeError:
                images = [product["images"]]
            result.append({**dict(product), "images": images, "variants": [dict(variant) for variant in variants]})
    return result


@app.post("/api/v1/products")
def create_product(product: ProductCreate):
    try:
        with database() as conn:
            cursor = conn.execute("INSERT INTO products (name, base_price, discount_percent, category, images, brand, description, seller_id, ai_sentiment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", (product.name, product.base_price, product.discount_percent, product.category, json.dumps(product.images), product.brand, product.description, product.seller_id, product.ai_sentiment))
            product_id = cursor.lastrowid
            conn.executemany("INSERT INTO product_variants (product_id, size, color, price, stock, sku, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)", [(product_id, item.size, item.color, item.price, item.stock, item.sku, item.image_url) for item in product.variants])
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="A variant SKU already exists")
    return {"status": "success", "product_id": product_id}


@app.get("/api/v1/orders")
def get_orders():
    with database() as conn:
        rows = conn.execute("SELECT * FROM orders ORDER BY rowid DESC").fetchall()
    return [dict(row) for row in rows]


@app.get("/api/v1/customer/orders")
def get_customer_orders(phone: str):
    """Return the order-history view used by the customer tracking screen."""
    with database() as conn:
        rows = conn.execute("SELECT * FROM orders WHERE customerPhone = ? ORDER BY rowid DESC", (phone.strip(),)).fetchall()
    return [dict(row) for row in rows]


@app.post("/api/v1/orders")
def create_order(order: OrderCreateRequest):
    if order.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid order status")
    try:
        with database() as conn:
            for item in order.cartItems:
                variant = conn.execute("SELECT stock FROM product_variants WHERE product_id = ? AND sku = ?", (item.id, item.variant_sku)).fetchone()
                if not variant:
                    raise HTTPException(status_code=404, detail=f"Variant {item.variant_sku} was not found")
                if variant["stock"] < item.quantity:
                    raise HTTPException(status_code=400, detail=f"Insufficient stock for {item.variant_sku}")
                conn.execute("UPDATE product_variants SET stock = stock - ? WHERE product_id = ? AND sku = ?", (item.quantity, item.id, item.variant_sku))
            conn.execute("INSERT INTO orders (orderId, date, customerName, customerPhone, customerAddress, itemsCount, shippingFee, total, paymentMethod, itemsDetails, status, orderNote, giftWrap) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", (order.orderId, order.date, order.customerName, order.customerPhone, order.customerAddress, order.itemsCount, order.shippingFee, order.total, order.paymentMethod, order.itemsDetails, order.status, order.orderNote, int(order.giftWrap)))
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Order ID already exists")
    return {"success": True, "orderId": order.orderId}


@app.post("/api/v1/wishlist")
def toggle_wishlist(user_id: str, product_id: int):
    with database() as conn:
        exists = conn.execute("SELECT 1 FROM wishlist WHERE user_id = ? AND product_id = ?", (user_id, product_id)).fetchone()
        if exists:
            conn.execute("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?", (user_id, product_id))
            return {"status": "removed"}
        conn.execute("INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)", (user_id, product_id))
    return {"status": "added"}


@app.get("/api/v1/wishlist/{user_id}")
def get_wishlist(user_id: str):
    with database() as conn:
        rows = conn.execute("SELECT product_id FROM wishlist WHERE user_id = ?", (user_id,)).fetchall()
    return [row["product_id"] for row in rows]


@app.post("/api/v1/reviews")
def add_review(review: ReviewCreate):
    with database() as conn:
        if not conn.execute("SELECT 1 FROM products WHERE id = ?", (review.product_id,)).fetchone():
            raise HTTPException(status_code=404, detail="Product not found")
        reviewer = review.customer_name or review.user_id or "Customer"
        conn.execute("INSERT INTO reviews (product_id, user_id, rating, comment, date) VALUES (?, ?, ?, ?, ?)", (review.product_id, reviewer, review.rating, review.comment, datetime.now().strftime("%Y-%m-%d")))
        average, count = conn.execute("SELECT AVG(rating), COUNT(*) FROM reviews WHERE product_id = ?", (review.product_id,)).fetchone()
        conn.execute("UPDATE products SET rating = ?, review_count = ? WHERE id = ?", (round(average, 1), count, review.product_id))
    return {"success": True, "message": "Review added successfully"}


@app.get("/api/v1/reviews/{product_id}")
def get_reviews(product_id: int):
    with database() as conn:
        rows = conn.execute("SELECT user_id, rating, comment, date FROM reviews WHERE product_id = ? ORDER BY id DESC", (product_id,)).fetchall()
    return [{"customer_name": row["user_id"], "rating": row["rating"], "comment": row["comment"], "date": row["date"]} for row in rows]


class ChatMessage(BaseModel):
    product_id: int
    sender: str = Field(min_length=1)
    message: str = Field(min_length=1)
    timestamp: str | None = None


@app.post("/api/v1/chats")
def send_chat(message: ChatMessage):
    with database() as conn:
        conn.execute("INSERT INTO chats (product_id, sender, message, timestamp) VALUES (?, ?, ?, ?)", (message.product_id, message.sender, message.message, message.timestamp or datetime.now().isoformat(timespec="minutes")))
    return {"success": True}


@app.get("/api/v1/chats/{product_id}")
def get_chats(product_id: int):
    with database() as conn:
        rows = conn.execute("SELECT sender, message, timestamp FROM chats WHERE product_id = ? ORDER BY id", (product_id,)).fetchall()
    return [dict(row) for row in rows]


@app.get("/api/v1/esewa-signature")
def get_esewa_signature(total_amount: str, transaction_uuid: str, product_code: str = "EPAYTEST"):
    secret_key = os.getenv("ESEWA_SECRET_KEY", "8g8M8GmgdKVN2yFq")
    message = f"total_amount={total_amount},transaction_uuid={transaction_uuid},product_code={product_code}"
    signature = base64.b64encode(hmac.new(secret_key.encode(), message.encode(), hashlib.sha256).digest()).decode()
    return {"signature": signature, "product_code": product_code, "total_amount": total_amount}


@app.get("/api/v1/seller/analytics")
def get_seller_analytics():
    with database() as conn:
        total_products = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
        total_orders, total_revenue = conn.execute("SELECT COUNT(*), COALESCE(SUM(total), 0) FROM orders").fetchone()
        out_of_stock = conn.execute("SELECT COUNT(*) FROM product_variants WHERE stock = 0").fetchone()[0]
    return {"total_products": total_products, "total_orders": total_orders, "total_revenue": round(total_revenue, 2), "out_of_stock": out_of_stock}


@app.put("/api/v1/seller/orders/{order_id}/status")
def update_order_status(order_id: str, payload: OrderStatusUpdate):
    if payload.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid order status")
    with database() as conn:
        cursor = conn.execute("UPDATE orders SET status = ? WHERE orderId = ?", (payload.status, order_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Order not found")
    return {"success": True, "message": f"Order status updated to {payload.status}"}


@app.post("/api/v1/upload")
async def upload_file(file: UploadFile = File(...)):
    filename = Path(file.filename or "upload").name
    if not filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    destination = UPLOAD_DIR / filename
    try:
        content = await file.read()
        destination.write_bytes(content)
    except OSError as error:
        raise HTTPException(status_code=500, detail=str(error))
    return {"url": f"http://127.0.0.1:8000/uploads/{filename}"}


init_db()
