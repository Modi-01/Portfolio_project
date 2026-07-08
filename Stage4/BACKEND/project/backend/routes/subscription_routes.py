from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter, HTTPException, Header, Depends
from database import get_db_connection
from schemas import SubscriptionCreateRequest, SubscriptionCreateResponse
from auth import verify_token

router = APIRouter(
    prefix="/api/subscriptions",
    tags=["Subscriptions"]
)

# Team decision (sprint plan Option A): fixed price per subscription until
# meal prices are added to the schema
ORIGINAL_PRICE = Decimal("500.00")


def verify_client(authorization: str = Header(None)) -> dict:
    """Verify that the request is from a client user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization[7:]
    try:
        payload = verify_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

    if payload.get("user_type") != "client":
        raise HTTPException(status_code=403, detail="Only clients can create subscriptions")
    return payload


@router.post("", response_model=SubscriptionCreateResponse)
def create_subscription(
    request: SubscriptionCreateRequest,
    client_user: dict = Depends(verify_client)
):
    """
    Create a subscription and its payment row (payment_status='pending')
    in ONE database transaction.
    """
    if request.end_date <= request.start_date:
        raise HTTPException(status_code=400, detail="end_date must be after start_date")

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Discount lookup (outside the write transaction — read only)
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
                client_user["user_id"],
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
