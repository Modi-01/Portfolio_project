from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection
from routes.auth_routes import router as auth_router
from routes.meal_routes import router as meal_router
from routes.subscription_routes import router as subscription_router
from routes.admin_routes import router as admin_router
from routes.restaurant_routes import router as restaurant_router
from routes.payment_routes import router as payment_router
from routes.discount_routes import router as discount_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(restaurant_router)
app.include_router(meal_router)
app.include_router(subscription_router)
app.include_router(payment_router)
app.include_router(discount_router)


@app.get("/")
def home():
    return {
        "message": "Qooti Backend API is running.",
        "version": "1.0.0"
    }
