from fastapi import APIRouter, HTTPException, Header, Depends
from database import get_db_connection
from schemas import (
    RestaurantListResponse,
    RestaurantDetailResponse,
    UpdateRestaurantStatusRequest,
    UpdateRestaurantStatusResponse,
    RestaurantStatus
)
from auth import verify_token

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)


def verify_admin(authorization: str = Header(None)) -> dict:
    """Verify that the request is from an admin user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization[7:]
    try:
        payload = verify_token(token)
        if payload.get("user_type") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return payload
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


@router.get("/restaurants", response_model=list[RestaurantDetailResponse])
def list_all_restaurants(status: str = None, admin_user: dict = Depends(verify_admin)):
    """List all restaurants with their approval status"""
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if status and status.lower() == "pending":
            cursor.execute(
                """
                SELECT restaurant_id, user_id, restaurant_name, description,
                       is_verified, rejection_reason, created_at
                FROM restaurant
                WHERE is_verified = FALSE AND rejection_reason IS NULL
                ORDER BY created_at DESC;
                """
            )
        elif status and status.lower() == "approved":
            cursor.execute(
                """
                SELECT restaurant_id, user_id, restaurant_name, description,
                       is_verified, rejection_reason, created_at
                FROM restaurant
                WHERE is_verified = TRUE
                ORDER BY created_at DESC;
                """
            )
        elif status and status.lower() == "rejected":
            cursor.execute(
                """
                SELECT restaurant_id, user_id, restaurant_name, description,
                       is_verified, rejection_reason, created_at
                FROM restaurant
                WHERE is_verified = FALSE AND rejection_reason IS NOT NULL
                ORDER BY created_at DESC;
                """
            )
        else:
            cursor.execute(
                """
                SELECT restaurant_id, user_id, restaurant_name, description,
                       is_verified, rejection_reason, created_at
                FROM restaurant
                ORDER BY created_at DESC;
                """
            )

        restaurants = cursor.fetchall()
        result = []
        for r in restaurants:
            restaurant = dict(r)
            restaurant['created_at'] = str(restaurant['created_at'])
            result.append(restaurant)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.get("/restaurants/pending", response_model=list[RestaurantListResponse])
def list_pending_restaurants(admin_user: dict = Depends(verify_admin)):
    """List pending restaurants awaiting approval"""
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT restaurant_id, user_id, restaurant_name, description, created_at
            FROM restaurant
            WHERE is_verified = FALSE AND rejection_reason IS NULL
            ORDER BY created_at DESC;
            """
        )

        restaurants = cursor.fetchall()
        result = []
        for r in restaurants:
            restaurant = dict(r)
            restaurant['created_at'] = str(restaurant['created_at'])
            result.append(restaurant)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.patch("/restaurants/{restaurant_id}/status", response_model=UpdateRestaurantStatusResponse)
def update_restaurant_status(
    restaurant_id: int,
    request: UpdateRestaurantStatusRequest,
    admin_user: dict = Depends(verify_admin)
):
    """Approve or reject a restaurant"""
    if request.status == RestaurantStatus.rejected and not request.rejection_reason:
        raise HTTPException(
            status_code=400,
            detail="rejection_reason is required when rejecting a restaurant"
        )

    if request.status == RestaurantStatus.approved and request.rejection_reason:
        raise HTTPException(
            status_code=400,
            detail="rejection_reason should be null when approving a restaurant"
        )

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT restaurant_id FROM restaurant WHERE restaurant_id = %s;",
            (restaurant_id,)
        )

        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Restaurant not found")

        is_verified = request.status == RestaurantStatus.approved
        rejection_reason = None if is_verified else request.rejection_reason

        cursor.execute(
            """
            UPDATE restaurant
            SET is_verified = %s, rejection_reason = %s
            WHERE restaurant_id = %s
            RETURNING restaurant_id, is_verified;
            """,
            (is_verified, rejection_reason, restaurant_id)
        )

        result = cursor.fetchone()
        conn.commit()

        status_text = "approved" if is_verified else "rejected"

        return {
            "message": f"Restaurant {status_text} successfully",
            "restaurant_id": result["restaurant_id"],
            "is_verified": result["is_verified"]
        }

    except HTTPException:
        raise

    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
