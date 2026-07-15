from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database import get_db_connection
from auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    health_goal: Optional[str] = None
    address: Optional[str] = None


PROFILE_FIELDS = """
    user_id, user_type, full_name, email, phone, age, gender,
    height_cm, weight_kg, health_goal, address, created_at
"""


@router.get("/me")
def get_my_profile(current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            f"SELECT {PROFILE_FIELDS} FROM app_user WHERE user_id = %s;",
            (current_user["user_id"],)
        )
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        return {"user": user}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.put("/me")
def update_my_profile(payload: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        fields = payload.dict(exclude_unset=True)
        if not fields:
            raise HTTPException(status_code=400, detail="No fields to update.")

        set_clause = ", ".join(f"{key} = %s" for key in fields)
        values = list(fields.values()) + [current_user["user_id"]]

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            f"UPDATE app_user SET {set_clause} WHERE user_id = %s RETURNING {PROFILE_FIELDS};",
            values
        )
        conn.commit()
        user = cursor.fetchone()
        return {"user": user}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
