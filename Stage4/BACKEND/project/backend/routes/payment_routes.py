import uuid

from fastapi import APIRouter, HTTPException, Header, Depends
from database import get_db_connection
from schemas import PaymentProcessRequest, PaymentProcessResponse
from auth import verify_token

router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"]
)


def verify_user(authorization: str = Header(None)) -> dict:
    """Verify the request carries a valid token and return its payload"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization[7:]
    try:
        return verify_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


@router.post("", response_model=PaymentProcessResponse)
def process_payment(
    request: PaymentProcessRequest,
    current_user: dict = Depends(verify_user)
):
    """
    Process the payment for a subscription (mock gateway — always succeeds).

    Marks the payment 'success' and confirms the subscription in ONE
    database transaction.
    """
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT subscription_id, user_id, final_price, status
            FROM subscription
            WHERE subscription_id = %s;
            """,
            (request.subscription_id,)
        )
        subscription = cursor.fetchone()

        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found")

        if subscription["user_id"] != current_user.get("user_id"):
            raise HTTPException(status_code=403, detail="You can only pay for your own subscriptions")

        if subscription["status"] == "cancelled":
            raise HTTPException(status_code=400, detail="Subscription is cancelled")

        cursor.execute(
            """
            SELECT payment_id, payment_status, amount
            FROM payment
            WHERE subscription_id = %s;
            """,
            (request.subscription_id,)
        )
        payment = cursor.fetchone()

        if not payment:
            raise HTTPException(status_code=404, detail="Payment record not found for this subscription")

        if payment["payment_status"] != "pending":
            raise HTTPException(
                status_code=400,
                detail=f"Payment is already {payment['payment_status']}"
            )

        # Mock gateway response — no real payment provider in this sprint
        transaction_id = f"MOCK-{uuid.uuid4().hex[:12].upper()}"
        gateway_response = "Mock gateway: payment approved"

        # Transaction: payment success + subscription confirmation together
        cursor.execute(
            """
            UPDATE payment
            SET payment_status = 'success', transaction_id = %s, gateway_response = %s
            WHERE payment_id = %s
            RETURNING payment_id, subscription_id, payment_status, amount, transaction_id;
            """,
            (transaction_id, gateway_response, payment["payment_id"])
        )
        updated_payment = cursor.fetchone()

        cursor.execute(
            """
            UPDATE subscription
            SET status = 'confirmed'
            WHERE subscription_id = %s
            RETURNING status;
            """,
            (request.subscription_id,)
        )
        updated_subscription = cursor.fetchone()

        conn.commit()

        return {
            "message": "Payment processed successfully. Subscription confirmed.",
            "payment_id": updated_payment["payment_id"],
            "subscription_id": updated_payment["subscription_id"],
            "payment_status": updated_payment["payment_status"],
            "amount": updated_payment["amount"],
            "transaction_id": updated_payment["transaction_id"],
            "subscription_status": updated_subscription["status"]
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
