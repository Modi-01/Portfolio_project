import json
import os
from urllib.parse import urlencode

import requests
from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.responses import RedirectResponse
from database import get_db_connection
from schemas import PaymentProcessRequest, PaymentProcessResponse
from auth import verify_token

router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"]
)

MOYASAR_API_BASE_URL = "https://api.moyasar.com/v1"


def _result_redirect(**params) -> RedirectResponse:
    """Send the customer's browser to the frontend payment-result page."""
    frontend = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")
    query = urlencode({k: v for k, v in params.items() if v is not None})
    return RedirectResponse(f"{frontend}/payment-result?{query}")


def verify_user(authorization: str = Header(None)) -> dict:
    """Verify the request carries a valid token and return its payload"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization[7:]
    try:
        return verify_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


def moyasar_auth():
    """Return (secret_key, base_url) for Moyasar, or fail loudly if unconfigured"""
    secret = os.getenv("MOYASAR_SECRET_KEY")
    base_url = os.getenv("MOYASAR_API_BASE_URL", MOYASAR_API_BASE_URL)

    if not secret or "YOUR_SECRET_KEY" in secret:
        raise HTTPException(
            status_code=500,
            detail="Moyasar API key not configured. Set MOYASAR_SECRET_KEY in .env"
        )
    return secret, base_url


def moyasar_create_payment(amount_sar, description, request: PaymentProcessRequest):
    """
    Create a payment at Moyasar (credit card, 3D Secure).

    Moyasar does not charge immediately: it returns status='initiated' plus a
    transaction_url where the customer completes 3D Secure. The payment only
    becomes 'paid' after that, and Moyasar then redirects the browser to
    MOYASAR_CALLBACK_URL.
    """
    secret, base_url = moyasar_auth()
    callback_url = os.getenv("MOYASAR_CALLBACK_URL", "http://127.0.0.1:8000/api/payments/callback")

    payload = {
        # Moyasar expects the amount in halalas (1 SAR = 100 halalas)
        "amount": int(amount_sar * 100),
        "currency": "SAR",
        "description": description,
        "callback_url": callback_url,
        "source": {
            "type": "creditcard",
            "name": request.card_holder_name,
            "number": request.card_number,
            "cvc": request.card_cvc,
            "month": request.card_expiry_month,
            "year": request.card_expiry_year
        }
    }

    try:
        response = requests.post(
            f"{base_url}/payments",
            json=payload,
            auth=(secret, ""),
            timeout=15
        )
        data = response.json()
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=500, detail="Payment gateway timeout. Please try again.")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Payment gateway error: {str(e)}")
    except ValueError:
        raise HTTPException(status_code=500, detail="Invalid response from payment gateway")

    if response.status_code not in (200, 201):
        # Moyasar validation errors (bad card number, expired card, ...)
        message = data.get("message", "Payment rejected by gateway")
        errors = data.get("errors")
        detail = f"{message}: {errors}" if errors else message
        raise HTTPException(status_code=400, detail=detail)

    if data.get("status") == "failed":
        message = (data.get("source") or {}).get("message") or data.get("message", "Card declined")
        raise HTTPException(status_code=400, detail=f"Payment failed: {message}")

    return data


def moyasar_fetch_payment(moyasar_payment_id):
    """Fetch a payment from Moyasar to verify its real status (never trust the browser)"""
    secret, base_url = moyasar_auth()

    try:
        response = requests.get(
            f"{base_url}/payments/{moyasar_payment_id}",
            auth=(secret, ""),
            timeout=15
        )
        data = response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Payment gateway error: {str(e)}")
    except ValueError:
        raise HTTPException(status_code=500, detail="Invalid response from payment gateway")

    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="Payment not found at gateway")

    return data


@router.post("", response_model=PaymentProcessResponse)
def process_payment(
    request: PaymentProcessRequest,
    current_user: dict = Depends(verify_user)
):
    """
    Start the payment for a subscription via Moyasar.

    Creates the payment at Moyasar and stores its id as transaction_id.
    The payment stays 'pending' until the customer completes 3D Secure at
    the returned transaction_url; Moyasar then redirects to our callback,
    which confirms the subscription.
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

        moyasar_payment = moyasar_create_payment(
            amount_sar=float(payment["amount"]),
            description=f"Qooti subscription #{request.subscription_id}",
            request=request
        )

        transaction_url = (moyasar_payment.get("source") or {}).get("transaction_url")

        # Store the Moyasar payment id now so the callback can find this row.
        # payment_status stays 'pending' until 3D Secure completes.
        cursor.execute(
            """
            UPDATE payment
            SET transaction_id = %s, gateway_response = %s
            WHERE payment_id = %s
            RETURNING payment_id, subscription_id, payment_status, amount, transaction_id;
            """,
            (moyasar_payment["id"], json.dumps(moyasar_payment), payment["payment_id"])
        )
        updated_payment = cursor.fetchone()
        conn.commit()

        return {
            "message": "Payment initiated. Complete 3D Secure at transaction_url to confirm.",
            "payment_id": updated_payment["payment_id"],
            "subscription_id": updated_payment["subscription_id"],
            "payment_status": updated_payment["payment_status"],
            "amount": updated_payment["amount"],
            "transaction_id": updated_payment["transaction_id"],
            "subscription_status": subscription["status"],
            "transaction_url": transaction_url
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


@router.get("/callback")
def payment_callback(id: str = None, status: str = None, message: str = None):
    """
    Moyasar redirects the customer's browser here after 3D Secure.

    The query params are informational only — the real status is fetched
    from Moyasar server-to-server before touching the database.

    This endpoint serves the customer's BROWSER, so every outcome redirects
    to the frontend /payment-result page instead of returning JSON.
    """
    if not id:
        return _result_redirect(status="error", message="Missing payment id")

    try:
        moyasar_payment = moyasar_fetch_payment(id)
    except HTTPException as e:
        return _result_redirect(status="error", message=str(e.detail))
    real_status = moyasar_payment.get("status")

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT payment_id, subscription_id, payment_status
            FROM payment
            WHERE transaction_id = %s;
            """,
            (id,)
        )
        payment = cursor.fetchone()

        if not payment:
            return _result_redirect(status="error", message="No payment matches this transaction")

        if payment["payment_status"] == "success":
            return _result_redirect(status="success", subscription_id=payment["subscription_id"])

        if real_status == "paid":
            # Transaction: payment success + subscription confirmation together
            cursor.execute(
                """
                UPDATE payment
                SET payment_status = 'success', gateway_response = %s
                WHERE payment_id = %s;
                """,
                (json.dumps(moyasar_payment), payment["payment_id"])
            )
            cursor.execute(
                """
                UPDATE subscription
                SET status = 'confirmed'
                WHERE subscription_id = %s;
                """,
                (payment["subscription_id"],)
            )
            conn.commit()

            return _result_redirect(
                status="success",
                subscription_id=payment["subscription_id"]
            )

        if real_status == "failed":
            failure_message = (moyasar_payment.get("source") or {}).get("message") or "Card declined"
            cursor.execute(
                """
                UPDATE payment
                SET payment_status = 'failed', gateway_response = %s
                WHERE payment_id = %s;
                """,
                (json.dumps(moyasar_payment), payment["payment_id"])
            )
            conn.commit()

            return _result_redirect(
                status="failed",
                subscription_id=payment["subscription_id"],
                message=failure_message
            )

        # Still 'initiated' or 'authorized' — 3D Secure not finished yet
        return _result_redirect(
            status="pending",
            subscription_id=payment["subscription_id"]
        )

    except Exception as e:
        if conn:
            conn.rollback()
        return _result_redirect(status="error", message=str(e))

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
