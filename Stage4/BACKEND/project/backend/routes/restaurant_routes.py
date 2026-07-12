from fastapi import APIRouter, HTTPException
from database import get_db_connection
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
