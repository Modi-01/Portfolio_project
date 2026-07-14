from fastapi import APIRouter, HTTPException
from database import get_db_connection
from schemas import DiscountValidateRequest, DiscountValidateResponse

router = APIRouter(
    prefix="/api/discount-codes",
    tags=["Discount Codes"]
)


@router.post("/validate", response_model=DiscountValidateResponse)
def validate_discount_code(request: DiscountValidateRequest):
    """
    Validate a discount code string at checkout and return its id + percentage.

    The frontend uses the returned discount_code_id in POST /api/subscriptions,
    which re-validates server-side before applying the discount — this endpoint
    only exists so customers can type a human-readable code.
    """
    code = request.code.strip().upper()

    if not code:
        raise HTTPException(status_code=400, detail="Discount code is required.")

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT discount_code_id, code, discount_percentage, is_active,
                   (expires_at IS NOT NULL AND expires_at < NOW()) AS is_expired
            FROM discount_code
            WHERE UPPER(code) = %s;
            """,
            (code,)
        )

        discount = cursor.fetchone()

        if not discount:
            raise HTTPException(status_code=404, detail="Discount code does not exist.")

        if not discount["is_active"]:
            raise HTTPException(status_code=400, detail="Discount code is no longer active.")

        if discount["is_expired"]:
            raise HTTPException(status_code=400, detail="Discount code has expired.")

        return {
            "discount_code_id": discount["discount_code_id"],
            "code": discount["code"],
            "discount_percentage": discount["discount_percentage"],
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
