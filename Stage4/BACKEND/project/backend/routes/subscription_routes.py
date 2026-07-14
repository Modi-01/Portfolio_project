from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter, HTTPException, Depends
from database import get_db_connection
from schemas import SubscriptionCreateRequest, SubscriptionCreateResponse
from auth import get_current_user

router = APIRouter(
    prefix="/api/subscriptions",
    tags=["Subscriptions"]
)

# Team decision (sprint plan Option A): fixed price per subscription until
# meal prices are added to the schema
ORIGINAL_PRICE = Decimal("250.00")


@router.get("/{user_id}")
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


@router.get("/{subscription_id}/schedule")
def get_subscription_schedule(
    subscription_id: int,
    current_user: dict = Depends(get_current_user)
):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT subscription_id, user_id
            FROM subscription
            WHERE subscription_id = %s;
            """,
            (subscription_id,)
        )

        subscription = cursor.fetchone()

        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found.")

        if current_user["user_type"] == "client" and subscription["user_id"] != current_user["user_id"]:
            raise HTTPException(
                status_code=403,
                detail="You can only view your own subscription schedule."
            )

        cursor.execute(
            """
            SELECT
                oi.order_item_id,
                oi.day_date,
                oi.day_of_week,
                oi.status,
                m.meal_id,
                m.name,
                m.description,
                m.calories,
                m.protein_g,
                m.carbs_g,
                m.fats_g,
                m.image_url
            FROM order_item oi
            JOIN meal m ON m.meal_id = oi.meal_id
            WHERE oi.subscription_id = %s
            ORDER BY oi.day_date;
            """,
            (subscription_id,)
        )

        schedule = cursor.fetchall()

        return {
            "subscription_id": subscription_id,
            "schedule": schedule
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.post("", response_model=SubscriptionCreateResponse)
def create_subscription(
    request: SubscriptionCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a subscription and its payment row (payment_status='pending')
    in ONE database transaction.
    """
    if current_user["user_type"] != "client":
        raise HTTPException(status_code=403, detail="Only clients can create subscriptions")

    if request.end_date <= request.start_date:
        raise HTTPException(status_code=400, detail="end_date must be after start_date")

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Discount lookup (outside the write transaction - read only)
        discount_amount = Decimal("0.00")
        if request.discount_code_id is not None:
            cursor.execute(
                """
                SELECT discount_code_id, discount_percentage, is_active,
                       (expires_at IS NOT NULL AND expires_at < NOW()) AS is_expired
                FROM discount_code
                WHERE discount_code_id = %s;
                """,
                (request.discount_code_id,)
            )
            discount = cursor.fetchone()

            if not discount:
                raise HTTPException(status_code=400, detail="Discount code does not exist")
            if not discount["is_active"]:
                raise HTTPException(status_code=400, detail="Discount code is not active")
            if discount["is_expired"]:
                raise HTTPException(status_code=400, detail="Discount code has expired")

            percentage = Decimal(discount["discount_percentage"])
            discount_amount = (ORIGINAL_PRICE * percentage / Decimal("100")).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )

        final_price = ORIGINAL_PRICE - discount_amount

        # Transaction: subscription + pending payment must commit together
        cursor.execute(
            """
            INSERT INTO subscription (
                user_id, discount_code_id, start_date, end_date, delivery_time,
                original_price, discount_amount, final_price
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING subscription_id, user_id, start_date, end_date, delivery_time,
                      discount_code_id, original_price, discount_amount, final_price,
                      status, created_at;
            """,
            (
                current_user["user_id"],
                request.discount_code_id,
                request.start_date,
                request.end_date,
                request.delivery_time,
                ORIGINAL_PRICE,
                discount_amount,
                final_price
            )
        )
        subscription = cursor.fetchone()

        cursor.execute(
            """
            INSERT INTO payment (subscription_id, amount, payment_status)
            VALUES (%s, %s, 'pending')
            RETURNING payment_id, payment_status;
            """,
            (subscription["subscription_id"], final_price)
        )
        payment = cursor.fetchone()

        conn.commit()

        return {
            "message": "Subscription created successfully. Payment is pending.",
            "subscription_id": subscription["subscription_id"],
            "user_id": subscription["user_id"],
            "start_date": subscription["start_date"],
            "end_date": subscription["end_date"],
            "delivery_time": subscription["delivery_time"],
            "discount_code_id": subscription["discount_code_id"],
            "original_price": subscription["original_price"],
            "discount_amount": subscription["discount_amount"],
            "final_price": subscription["final_price"],
            "status": subscription["status"],
            "payment_id": payment["payment_id"],
            "payment_status": payment["payment_status"],
            "created_at": str(subscription["created_at"])
        }

    except HTTPException:
        if conn:
            conn.rollback()
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
