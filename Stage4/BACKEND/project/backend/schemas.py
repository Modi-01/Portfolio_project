from typing import Optional
from pydantic import BaseModel
from enum import Enum


class UserType(str, Enum):
    client = "client"
    restaurant = "restaurant"
    admin = "admin"


class Gender(str, Enum):
    male = "male"
    female = "female"


class HealthGoal(str, Enum):
    lose_weight = "lose_weight"
    maintain = "maintain"
    bulking = "bulking"
    gaining_weight = "gaining_weight"


class RegisterRequest(BaseModel):
    user_type: UserType
    full_name: str
    email: str
    password: str
    phone: str
    age: Optional[int] = None
    gender: Optional[Gender] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    health_goal: Optional[HealthGoal] = None
    address: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterResponse(BaseModel):
    message: str
    user_id: int


class UserResponse(BaseModel):
    user_id: int
    full_name: str
    email: str
    user_type: str


class LoginResponse(BaseModel):
    message: str
    access_token: str
    token_type: str
    user: UserResponse

class MessageResponse(BaseModel):
    message: str