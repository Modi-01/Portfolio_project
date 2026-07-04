from fastapi import FastAPI
from database import get_db_connection
from routes.auth_routes import router as auth_router

app = FastAPI()

app.include_router(auth_router)

@app.get("/")
def home():
    return {
        "message": "Qooti Backend API is running.",
        "version": "1.0.0"
    }