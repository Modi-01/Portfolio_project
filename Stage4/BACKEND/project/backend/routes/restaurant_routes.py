from fastapi import APIRouter, HTTPException, Depends
from database import get_db_connection
from auth import get_current_user
from schemas import (
    PublicRestaurantListResponse,
    PublicRestaurantDetailResponse
)

router = APIRouter(
    prefix="/api/restaurants",
    tags=["Restaurants (Public)"]
)


@router.get("", response_model=list[PublicRestaurantListResponse])
def list_approved_restaurants():
    """List approved restaurants for public browsing (no auth required)"""
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT restaurant_id, restaurant_name, description, logo_url
            FROM restaurant
            WHERE is_verified = TRUE
            ORDER BY created_at DESC;
            """
        )

        return cursor.fetchall()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# Restaurant profile of the currently logged-in restaurant user.
# IMPORTANT: declared BEFORE "/{restaurant_id}" so the literal "me" is not
# captured by the integer path param (that mismatch previously returned 422).
@router.get("/me")
def get_current_restaurant(current_user: dict = Depends(get_current_user)):
    conn = None
    cursor = None

    try:
        if current_user["user_type"] != "restaurant":
            raise HTTPException(
                status_code=403,
                detail="Only restaurant users can access restaurant profile information."
            )

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                restaurant_id,
                user_id,
                restaurant_name,
                description,
                logo_url,
                is_verified,
                rejection_reason,
                created_at
            FROM restaurant
            WHERE user_id = %s;
            """,
            (current_user["user_id"],)
        )

        restaurant = cursor.fetchone()

        if not restaurant:
            raise HTTPException(
                status_code=404,
                detail="No restaurant profile is linked to this user."
            )

        return {"restaurant": restaurant}

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.get("/{restaurant_id}", response_model=PublicRestaurantDetailResponse)
def get_restaurant_details(restaurant_id: int):
    """Get details of a single approved restaurant (404 if missing or not approved)"""
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT restaurant_id, restaurant_name, description, logo_url,
                   is_verified, created_at
            FROM restaurant
            WHERE restaurant_id = %s AND is_verified = TRUE;
            """,
            (restaurant_id,)
        )

        restaurant = cursor.fetchone()

        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        restaurant = dict(restaurant)
        restaurant['created_at'] = str(restaurant['created_at'])
        return restaurant

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
