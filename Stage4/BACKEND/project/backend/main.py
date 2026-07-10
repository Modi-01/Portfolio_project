from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection
from routes.auth_routes import router as auth_router
from routes.admin_routes import router as admin_router
from routes.restaurant_routes import router as restaurant_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(restaurant_router)
