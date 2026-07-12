"""
Subscription & Payment test suite — Qooti Healthy Meals Platform.

Run with the backend venv (has requests + psycopg2) while the server is up:

    cd BACKEND/project/backend
    .venv/bin/python -m uvicorn main:app                          # terminal 1
    .venv/bin/python ../../../testing/test-subscriptions-payments.py  # terminal 2

Covers:
  Subscriptions — POST /api/subscriptions creates a subscription with
                  correct pricing (fixed base price, discount codes)
  Payments      — Moyasar sandbox payment flow: initiate (pending +
                  transaction_url) → scripted 3D Secure on Moyasar's test
                  ACS emulator → GET /api/payments/callback; plus DB
                  transaction atomicity under fault injection

Requires MOYASAR_SECRET_KEY (sk_test_...) configured in the backend .env —
payments run against the real Moyasar sandbox, no real money moves.
"""

import re
import sys
import time
from decimal import Decimal
from pathlib import Path
from urllib.parse import urljoin

import psycopg2
import requests
from psycopg2.extras import RealDictCursor

BASE_URL = "http://127.0.0.1:8000"

# Read DB credentials from the backend .env (DATABASE_URL)
ENV_FILE = Path(__file__).resolve().parents[1] / "BACKEND" / "project" / "backend" / ".env"
DATABASE_URL = None
for line in ENV_FILE.read_text().splitlines():
    if line.strip().startswith("DATABASE_URL="):
        DATABASE_URL = line.split("=", 1)[1].strip()
if not DATABASE_URL:
    sys.exit("DATABASE_URL not found in backend .env")

CLIENT_A = {"email": "qa.sub.client@example.com", "password": "Passw0rd!"}
CLIENT_B = {"email": "qa.sub.client.b@example.com", "password": "Passw0rd!"}
REST_USER = {"email": "qa.sub.rest@example.com", "password": "Passw0rd!"}

VALID_SUB = {
    "start_date": "2026-07-15",
    "end_date": "2026-07-21",
    "delivery_time": "09:00",
}

# Moyasar sandbox test card (never charged for real)
VALID_CARD = {
    "card_number": "4111111111111111",
    "card_expiry_month": 12,
    "card_expiry_year": 2030,
    "card_cvc": "123",
    "card_holder_name": "QA Test User",
}

# Values for the device-fingerprint form on Moyasar's 3DS prepare page
# (normally filled in by browser JavaScript)
DEVICE_INFO = {
    "color_depth": "24",
    "js_enabled": "true",
    "language": "en-US",
    "screen_height": "1080",
    "screen_width": "1920",
    "time_zone": "-180",
}

results = []


def check(case_id, name, condition, detail=""):
    results.append((case_id, name, bool(condition), detail))
    mark = "PASS" if condition else "FAIL"
    print(f"[{mark}] {case_id}: {name} {('— ' + detail) if detail else ''}")


def db():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


def db_one(query, params=None):
    with db() as conn, conn.cursor() as cur:
        cur.execute(query, params or ())
        return cur.fetchone()


def db_exec(query, params=None):
    with db() as conn, conn.cursor() as cur:
        cur.execute(query, params or ())
        conn.commit()


def register(user_type, email, password, **extra):
    payload = {
        "user_type": user_type,
        "full_name": f"QA {user_type} {email.split('@')[0]}",
        "email": email,
        "password": password,
        "phone": "+966500000000",
        **extra,
    }
    requests.post(f"{BASE_URL}/api/auth/register", json=payload)  # 400 if exists — fine


def login(creds):
    r = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
    r.raise_for_status()
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def create_sub(headers, **overrides):
    return requests.post(f"{BASE_URL}/api/subscriptions", json={**VALID_SUB, **overrides}, headers=headers)


def pay(headers, subscription_id, **card_overrides):
    """Initiate a Moyasar payment; returns pending + transaction_url on success"""
    payload = {"subscription_id": subscription_id, **VALID_CARD, **card_overrides}
    return requests.post(f"{BASE_URL}/api/payments", json=payload, headers=headers)


def callback(moyasar_payment_id):
    """Hit our callback endpoint the way Moyasar's browser redirect would"""
    return requests.get(f"{BASE_URL}/api/payments/callback", params={"id": moyasar_payment_id})


def complete_3ds(transaction_url, auth_result="AUTHENTICATED"):
    """
    Walk Moyasar's test-mode 3D Secure pages the way a browser would:
    prepare → authenticate (device info) → acs_emulator → set_auth_result
    → acs_return. Each page is a form that browser JS would auto-submit;
    we parse and submit them ourselves, keeping the session cookies.
    """
    session = requests.Session()
    response = session.get(transaction_url, timeout=20)

    for _ in range(8):
        form = re.search(r'<form[^>]*action="([^"]*)"[^>]*>(.*?)</form>', response.text, re.S)
        if not form:
            break

        action = urljoin(response.url, form.group(1))
        fields = {}
        for input_tag in re.findall(r"<input[^>]*>", form.group(2)):
            name = re.search(r'name="([^"]*)"', input_tag)
            if not name or name.group(1) in ("", "submit"):
                continue
            value = re.search(r'value="([^"]*)"', input_tag)
            fields[name.group(1)] = value.group(1) if value else DEVICE_INFO.get(name.group(1), "")

        if 'name="auth_result"' in form.group(2):
            fields["auth_result"] = auth_result

        response = session.post(action, data=fields, timeout=20)

        if action.endswith("/acs_return"):
            return True

    return False


def setup():
    client_fields = dict(age=30, gender="female", height_cm=165.0, weight_kg=60.0,
                         health_goal="maintain", address="Riyadh, KSA")
    register("client", CLIENT_A["email"], CLIENT_A["password"], **client_fields)
    register("client", CLIENT_B["email"], CLIENT_B["password"], **client_fields)
    register("restaurant", REST_USER["email"], REST_USER["password"])

    # Discount codes used by the pricing tests (idempotent)
    db_exec("""
        INSERT INTO discount_code (code, discount_percentage) VALUES
            ('SAVE10', 10.00), ('SAVE25', 25.00)
        ON CONFLICT (code) DO NOTHING;
    """)
    db_exec("""
        INSERT INTO discount_code (code, discount_percentage, is_active) VALUES
            ('INACTIVE10', 10.00, FALSE)
        ON CONFLICT (code) DO NOTHING;
    """)
    db_exec("""
        INSERT INTO discount_code (code, discount_percentage, expires_at) VALUES
            ('EXPIRED10', 10.00, NOW() - INTERVAL '1 day')
        ON CONFLICT (code) DO NOTHING;
    """)


def code_id(code):
    return db_one("SELECT discount_code_id FROM discount_code WHERE code = %s;", (code,))["discount_code_id"]


def test_subscription_creation(client_a):
    print("\n=== Subscriptions — creation & validation ===")

    r = create_sub(client_a)
    body = r.json()
    check("SUB1", "valid subscription (no discount) → 200 + subscription_id",
          r.status_code == 200 and "subscription_id" in body, f"status={r.status_code}")

    row = db_one("SELECT payment_status FROM payment WHERE subscription_id = %s;",
                 (body["subscription_id"],))
    check("SUB2", "subscription created → payment row status 'pending'",
          row and row["payment_status"] == "pending", f"db={row}")

    r = create_sub(client_a, discount_code_id=code_id("SAVE10"))
    check("SUB3", "valid subscription (with discount) → 200 + discount_amount calculated",
          r.status_code == 200 and Decimal(r.json()["discount_amount"]) == Decimal("50.00"),
          f"status={r.status_code} discount={r.json().get('discount_amount')}")

    r = create_sub(client_a, start_date="2026-07-21", end_date="2026-07-15")
    check("SUB4", "end_date < start_date → 400", r.status_code == 400, f"status={r.status_code}")

    r = create_sub(client_a, discount_code_id=999999)
    check("SUB5", "non-existent discount code → 400", r.status_code == 400, f"status={r.status_code}")

    payload = {k: v for k, v in VALID_SUB.items() if k != "start_date"}
    r = requests.post(f"{BASE_URL}/api/subscriptions", json=payload, headers=client_a)
    check("SUB6", "missing start_date → 422 validation error", r.status_code == 422, f"status={r.status_code}")

    r = requests.post(f"{BASE_URL}/api/subscriptions", json=VALID_SUB)
    check("SUB7", "no auth token → 401", r.status_code == 401, f"status={r.status_code}")

    rest = login(REST_USER)
    r = create_sub(rest)
    check("SUB8", "restaurant user → 403 (client-only)", r.status_code == 403, f"status={r.status_code}")


def test_discount_pricing(client_a):
    print("\n=== Subscriptions — discount pricing ===")

    r = create_sub(client_a, discount_code_id=code_id("SAVE10")).json()
    check("SUB9", "10% discount: 500.00 → 450.00",
          Decimal(r["final_price"]) == Decimal("450.00"), f"final={r['final_price']}")

    r = create_sub(client_a, discount_code_id=code_id("SAVE25")).json()
    check("SUB10", "25% discount: 500.00 → 375.00",
          Decimal(r["final_price"]) == Decimal("375.00"), f"final={r['final_price']}")

    r = create_sub(client_a).json()
    check("SUB11", "no discount: 500.00 → 500.00",
          Decimal(r["final_price"]) == Decimal("500.00"), f"final={r['final_price']}")

    # discount_percentage > 100 must be impossible at the schema level
    try:
        db_exec("INSERT INTO discount_code (code, discount_percentage) VALUES ('BAD150', 150.00);")
        db_exec("DELETE FROM discount_code WHERE code = 'BAD150';")
        check("SUB12", "discount > 100% rejected by DB constraint", False, "insert unexpectedly succeeded")
    except psycopg2.errors.CheckViolation:
        check("SUB12", "discount > 100% rejected by DB constraint", True, "chk_discount_percentage")

    r = create_sub(client_a, discount_code_id=code_id("INACTIVE10"))
    check("SUB13", "inactive discount code → 400", r.status_code == 400, f"status={r.status_code}")

    r = create_sub(client_a, discount_code_id=code_id("EXPIRED10"))
    check("SUB14", "expired discount code → 400", r.status_code == 400, f"status={r.status_code}")


def test_moyasar_payment_flow(client_a, client_b):
    print("\n=== Payments — Moyasar sandbox flow ===")

    sub = create_sub(client_a).json()
    sub_id = sub["subscription_id"]

    r = pay(client_a, sub_id)
    body = r.json() if r.status_code == 200 else {}
    check("PAY1", "initiate payment → 200, status 'pending' + transaction_url",
          r.status_code == 200 and body.get("payment_status") == "pending"
          and body.get("transaction_url"),
          f"status={r.status_code}")

    moyasar_id = body.get("transaction_id")
    row = db_one("SELECT transaction_id, payment_status FROM payment WHERE subscription_id = %s;", (sub_id,))
    check("PAY2", "DB: Moyasar payment id stored, payment still 'pending'",
          row["transaction_id"] == moyasar_id and row["payment_status"] == "pending",
          f"db={row['payment_status']}")

    r = callback(moyasar_id)
    check("PAY3", "callback before 3D Secure → not confirmed, stays 'pending'",
          r.status_code == 200 and r.json().get("payment_status") == "pending",
          f"resp={r.json().get('message', '')[:60]}")

    ok = complete_3ds(body["transaction_url"], "AUTHENTICATED")
    time.sleep(1)
    r = callback(moyasar_id)
    check("PAY4", "3D Secure approved + callback → payment 'success'",
          ok and r.status_code == 200 and r.json().get("payment_status") == "success",
          f"3ds={ok} resp={r.json().get('message', '')[:60]}")

    row = db_one("""
        SELECT p.payment_status, s.status AS sub_status
        FROM payment p JOIN subscription s USING (subscription_id)
        WHERE subscription_id = %s;
    """, (sub_id,))
    check("PAY5", "DB: payment 'success' and subscription 'confirmed'",
          row["payment_status"] == "success" and row["sub_status"] == "confirmed",
          f"db={row['payment_status']}/{row['sub_status']}")

    r = pay(client_a, 999999)
    check("PAY6", "non-existent subscription → 404", r.status_code == 404, f"status={r.status_code}")

    sub2 = create_sub(client_a).json()
    r = pay(client_b, sub2["subscription_id"])
    check("PAY7", "subscription not owned by user → 403", r.status_code == 403, f"status={r.status_code}")

    r = pay(client_a, sub_id)
    check("PAY8", "re-pay already-successful payment → 400",
          r.status_code == 400, f"status={r.status_code}")

    sub3 = create_sub(client_a).json()
    r = pay(client_a, sub3["subscription_id"], card_number="1234")
    check("PAY9", "invalid card number → 400 (rejected by Moyasar)",
          r.status_code == 400, f"status={r.status_code}")

    sub4 = create_sub(client_a).json()
    r = pay(client_a, sub4["subscription_id"])
    body4 = r.json()
    ok = complete_3ds(body4["transaction_url"], "UNAUTHENTICATED")
    time.sleep(1)
    r = callback(body4["transaction_id"])
    row = db_one("SELECT payment_status FROM payment WHERE subscription_id = %s;",
                 (sub4["subscription_id"],))
    check("PAY10", "3D Secure declined + callback → payment 'failed'",
          ok and r.status_code == 200 and row["payment_status"] == "failed",
          f"3ds={ok} db={row['payment_status']}")

    r = callback("00000000-0000-0000-0000-000000000000")
    check("PAY11", "callback with unknown transaction id → 404",
          r.status_code == 404, f"status={r.status_code}")


def test_transaction_atomicity(client_a):
    print("\n=== Payments — DB transaction atomicity (fault injection) ===")

    # Failure mid-subscription-creation: make the payment INSERT blow up,
    # then verify the subscription INSERT in the same request rolled back.
    db_exec("""
        CREATE OR REPLACE FUNCTION qa_fail() RETURNS trigger AS
        $$ BEGIN RAISE EXCEPTION 'QA fault injection'; END; $$ LANGUAGE plpgsql;
    """)
    before = db_one("SELECT COUNT(*) AS n FROM subscription;")["n"]
    db_exec("CREATE TRIGGER qa_fail_payment BEFORE INSERT ON payment FOR EACH ROW EXECUTE FUNCTION qa_fail();")
    try:
        r = create_sub(client_a)
        after = db_one("SELECT COUNT(*) AS n FROM subscription;")["n"]
        check("PAY12", "failure mid-creation → 500 and subscription NOT in DB (rolled back)",
              r.status_code == 500 and after == before,
              f"status={r.status_code} subs before={before} after={after}")
    finally:
        db_exec("DROP TRIGGER IF EXISTS qa_fail_payment ON payment;")

    # Failure mid-callback-confirmation: the callback updates payment then
    # subscription; if the subscription UPDATE blows up, the payment must
    # stay 'pending' even though Moyasar already reports 'paid'.
    sub = create_sub(client_a).json()
    sub_id = sub["subscription_id"]
    body = pay(client_a, sub_id).json()
    complete_3ds(body["transaction_url"], "AUTHENTICATED")
    time.sleep(1)
    db_exec("CREATE TRIGGER qa_fail_sub BEFORE UPDATE ON subscription FOR EACH ROW EXECUTE FUNCTION qa_fail();")
    try:
        r = callback(body["transaction_id"])
        row = db_one("SELECT payment_status FROM payment WHERE subscription_id = %s;", (sub_id,))
        check("PAY13", "failure mid-callback → 500 and payment stays 'pending' (rolled back)",
              r.status_code == 500 and row["payment_status"] == "pending",
              f"status={r.status_code} payment={row['payment_status']}")
    finally:
        db_exec("DROP TRIGGER IF EXISTS qa_fail_sub ON subscription;")
        db_exec("DROP FUNCTION IF EXISTS qa_fail();")

    orphan_subs = db_one("""
        SELECT COUNT(*) AS n FROM subscription s
        LEFT JOIN payment p USING (subscription_id) WHERE p.payment_id IS NULL;
    """)["n"]
    orphan_pays = db_one("""
        SELECT COUNT(*) AS n FROM payment p
        LEFT JOIN subscription s USING (subscription_id) WHERE s.subscription_id IS NULL;
    """)["n"]
    check("PAY14", "no orphaned rows (subscription↔payment always paired)",
          orphan_subs == 0 and orphan_pays == 0,
          f"orphan_subscriptions={orphan_subs} orphan_payments={orphan_pays}")


def main():
    setup()
    client_a = login(CLIENT_A)
    client_b = login(CLIENT_B)

    test_subscription_creation(client_a)
    test_discount_pricing(client_a)
    test_moyasar_payment_flow(client_a, client_b)
    test_transaction_atomicity(client_a)

    passed = sum(1 for _, _, ok, _ in results if ok)
    failed = len(results) - passed
    print(f"\n{'=' * 50}\nTotal: {len(results)}  Passed: {passed}  Failed: {failed}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
