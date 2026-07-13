from fastapi import APIRouter, HTTPException
from database import get_db_connection
from schemas import (
    RegisterRequest,
    LoginRequest,
    RegisterResponse,
    LoginResponse,
    MessageResponse
)
from auth import hash_password, verify_password, create_access_token

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/register", response_model=RegisterResponse)
def register_user(user: RegisterRequest):
    conn = None
    cursor = None

    try:
        # Validate client required fields
        if user.user_type == "client":
            if (
                user.age is None
                or user.gender is None
                or user.height_cm is None
                or user.weight_kg is None
                or user.health_goal is None
                or user.address is None
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Client must provide age, gender, height_cm, weight_kg, health_goal, and address."
                )

        # Validate restaurant/admin should NOT send health fields
        if user.user_type in ["restaurant", "admin"]:
            if (
                user.age is not None
                or user.gender is not None
                or user.height_cm is not None
                or user.weight_kg is not None
                or user.health_goal is not None
                or user.address is not None
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Restaurant and admin users cannot provide health profile or address fields."
                )

        # A restaurant registration must include the restaurant name (used to
        # create the linked restaurant profile below).
        if user.user_type == "restaurant" and not user.restaurant_name:
            raise HTTPException(
                status_code=400,
                detail="Restaurant must provide restaurant_name."
            )

        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if email already exists
        cursor.execute(
            "SELECT user_id FROM app_user WHERE email = %s;",
            (user.email,)
        )

        existing_user = cursor.fetchone()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered."
            )

        # Hash password
        hashed_password = hash_password(user.password)

        # Insert user
        cursor.execute(
            """
            INSERT INTO app_user (
                user_type,
                full_name,
                email,
                password_hash,
                phone,
                age,
                gender,
                height_cm,
                weight_kg,
                health_goal,
                address
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING user_id;
            """,
            (
                user.user_type,
                user.full_name,
                user.email,
                hashed_password,
                user.phone,
                user.age,
                user.gender,
                user.height_cm,
                user.weight_kg,
                user.health_goal,
                user.address
            )
        )

        new_user = cursor.fetchone()

        # Restaurant users get a linked restaurant profile row, created in the
        # same transaction. It starts unverified (is_verified = FALSE) so it
        # enters the admin approval queue.
        if user.user_type == "restaurant":
            cursor.execute(
                """
                INSERT INTO restaurant (user_id, restaurant_name, description, is_verified)
                VALUES (%s, %s, %s, FALSE);
                """,
                (new_user["user_id"], user.restaurant_name, user.description)
            )

        conn.commit()

        return {
            "message": "User registered successfully.",
            "user_id": new_user["user_id"]
        }

    except HTTPException:
        raise

    except Exception as e:
        if conn:
            conn.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.post("/login", response_model=LoginResponse)
def login_user(user: LoginRequest):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT user_id, full_name, email, password_hash, user_type, is_active
            FROM app_user
            WHERE email = %s;
            """,
            (user.email,)
        )

        db_user = cursor.fetchone()

        if not db_user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password."
            )

        if not verify_password(user.password, db_user["password_hash"]):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password."
            )

        if db_user["is_active"] is False:
            raise HTTPException(
                status_code=403,
                detail="User account is inactive."
            )

        access_token = create_access_token(
            data={
                "user_id": db_user["user_id"],
                "email": db_user["email"],
                "user_type": db_user["user_type"]
            }
        )

        return {
            "message": "Login successful.",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "user_id": db_user["user_id"],
                "full_name": db_user["full_name"],
                "email": db_user["email"],
                "user_type": db_user["user_type"]
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.post("/logout", response_model=MessageResponse)
def logout_user():
    return {
        "message": "Logout successful."
    }
