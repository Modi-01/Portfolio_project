from typing import List, Optional
from pydantic import BaseModel
from enum import Enum
from datetime import date, time
from decimal import Decimal

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

class MealCreateRequest(BaseModel):
    restaurant_id: int
    name: str
    description: str
    ingredients: str
    calories: int
    protein_g: float
    carbs_g: float
    fats_g: float
    image_url: str
    tags: List[str]


class MealUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    ingredients: Optional[str] = None
    calories: Optional[int] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fats_g: Optional[float] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None


class MealResponse(BaseModel):
    message: str

class MealSelectionItem(BaseModel):
    meal_id: int
    day_date: date
    day_of_week: str


class MealSelectionsCreateRequest(BaseModel):
    subscription_id: int
    selections: List[MealSelectionItem]


# Admin Restaurant Management Schemas

class RestaurantListResponse(BaseModel):
    restaurant_id: int
    user_id: int
    restaurant_name: str
    description: Optional[str] = None
    created_at: str


class RestaurantDetailResponse(BaseModel):
    restaurant_id: int
    user_id: int
    restaurant_name: str
    description: Optional[str] = None
    is_verified: bool
    rejection_reason: Optional[str] = None
    created_at: str


# Public Restaurant Schemas (no auth — must not expose rejection_reason)

class PublicRestaurantListResponse(BaseModel):
    restaurant_id: int
    restaurant_name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None


class PublicRestaurantDetailResponse(BaseModel):
    restaurant_id: int
    restaurant_name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    is_verified: bool
    created_at: str


class RestaurantStatus(str, Enum):
    approved = "approved"
    rejected = "rejected"


class UpdateRestaurantStatusRequest(BaseModel):
    status: RestaurantStatus
    rejection_reason: Optional[str] = None


class UpdateRestaurantStatusResponse(BaseModel):
    message: str
    restaurant_id: int
    is_verified: bool


class AdminOverviewResponse(BaseModel):
    total_restaurants: int
    pending_restaurants: int
    total_customers: int
    total_orders: int


# Subscription & Payment Schemas

class SubscriptionCreateRequest(BaseModel):
    start_date: date
    end_date: date
    delivery_time: time
    discount_code_id: Optional[int] = None


class SubscriptionCreateResponse(BaseModel):
    message: str
    subscription_id: int
    user_id: int
    start_date: date
    end_date: date
    delivery_time: time
    discount_code_id: Optional[int] = None
    original_price: Decimal
    discount_amount: Decimal
    final_price: Decimal
    status: str
    payment_id: int
    payment_status: str
    created_at: str


class PaymentProcessRequest(BaseModel):
    subscription_id: int
    card_number: str
    card_expiry_month: int
    card_expiry_year: int
    card_cvc: str
    card_holder_name: str


class PaymentProcessResponse(BaseModel):
    message: str
    payment_id: int
    subscription_id: int
    payment_status: str
    amount: Decimal
    transaction_id: str
    subscription_status: str
    # Moyasar 3D Secure page the customer must visit to complete the payment
    transaction_url: Optional[str] = None
