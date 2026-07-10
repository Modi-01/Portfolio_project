from fastapi import APIRouter, HTTPException, Depends
from database import get_db_connection
from auth import get_current_user

router = APIRouter(
    prefix="/api",
    tags=["Subscriptions"]
)


@router.get("/subscriptions/{user_id}")
def get_user_subscriptions(
    user_id: int,
    current_user: dict = Depends(get_current_user)
):
    conn = None
    cursor = None

    try:
        if current_user["user_type"] == "client":
            if current_user["user_id"] != user_id:
                raise HTTPException(
                    status_code=403,
                    detail="You can only view your own subscriptions."
                )

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                s.subscription_id,
                s.user_id,
                s.start_date,
                s.end_date,
                s.delivery_time,
                s.original_price,
                s.discount_amount,
                s.final_price,
                s.status,
                s.is_renewed,
                s.created_at,
                p.payment_status,
                p.transaction_id
            FROM subscription s
            LEFT JOIN payment p
                ON s.subscription_id = p.subscription_id
            WHERE s.user_id = %s
            ORDER BY s.created_at DESC;
            """,
            (user_id,)
        )

        subscriptions = cursor.fetchall()

        return {
            "user_id": user_id,
            "subscriptions": subscriptions
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