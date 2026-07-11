# Test Results — Qooti Healthy Meals Subscription Platform

**Automated test script (subscriptions, payments):** [`test-subscriptions-payments.py`](test-subscriptions-payments.py)

Results are organized by feature area: **Admin — Restaurant Approval**, **Public —
Restaurant Browsing**, **Subscriptions**, **Payments**. Each section lists its own
execution date, environment notes, and test-case table.

---

## Overall Summary

| Feature | Cases | Passed | Failed | Notes |
|---|---|---|---|---|
| Admin — Restaurant Approval | 18 | 18 | 0 | 1 minor contract observation (see AR7) |
| Public — Restaurant Browsing | 11 | 11 | 0 | |
| Subscriptions | 14 | 14 | 0 | 1 bug found & fixed (expired-discount 500→400) |
| Payments (Moyasar sandbox) | 14 | 14 | 0 | Full 3D Secure flow scripted end-to-end |
| **Total** | **57** | **57** | **0** | **100% pass rate** |

Meal CRUD (`POST/PUT/DELETE /api/meals`, `GET /api/restaurants/:id/meals`) is **not yet
implemented** and has no results here.

---

## Admin — Restaurant Approval Workflow

`GET /api/admin/restaurants`, `GET /api/admin/restaurants?status=…`,
`PATCH /api/admin/restaurants/:id/status`. Admin-only.

**Execution Date:** 2026-07-07

**Environment:**
- Server: FastAPI (`uvicorn main:app`) on `127.0.0.1:8000`, from `BACKEND/project/backend/`.
- Database: PostgreSQL `healthy_meals_db` (schema `schema0.1.sql` + `seed.sql`).
- Auth: registered a fresh admin (`qa.admin@qooti_admin.com`) — the seeded admin row
  carries a placeholder password hash and cannot log in. Registered a client
  (`qa.client@example.com`) for role-enforcement cases.
- Test data seeded (3 pending restaurants, since the seed set has none pending):
  - `restaurant_id = 3` "QA Pending Approve" → used by AP1, AP10
  - `restaurant_id = 4` "QA Pending Reject" → used by AP2
  - `restaurant_id = 5` "QA Pending Negatives" → stays pending, used by AP3–AP8
  - Pre-existing seed rows: `id 1` Green Bowl (approved), `id 2` Fit Kitchen (rejected)

> **Fix required to run:** the committed route file was named `admin_routes.py<U+200E>`
> (trailing invisible left-to-right mark), so `from routes.admin_routes import …` in
> `main.py` raised `ModuleNotFoundError` and the server would not boot. Renamed to a
> clean `admin_routes.py`.

### List Restaurants

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| AR1 | List pending restaurants | Admin JWT + `?status=pending` | 200, only is_verified=FALSE AND rejection_reason IS NULL | 200, ids=[5] | ✓ | |
| AR2 | List all restaurants | Admin JWT + `GET /api/admin/restaurants` | 200, all restaurants | 200, ids=[1,2,3,4,5] | ✓ | Ordered by created_at DESC |
| AR3 | Filter approved | Admin JWT + `?status=approved` | 200, only is_verified=TRUE | 200, ids=[1,3] | ✓ | |
| AR4 | Filter rejected | Admin JWT + `?status=rejected` | 200, only is_verified=FALSE AND reason NOT NULL | 200, ids=[2,4] | ✓ | |
| AR5 | Non-admin access | Client JWT | 403 Forbidden | 403 "Admin access required" | ✓ | Role enforcement |
| AR6 | No auth token | No Authorization header | 401 Unauthorized | 401 "Missing or invalid authorization header" | ✓ | |
| AR7 | Invalid status filter | `?status=banana` | 422 / 400 / or ignored → all | 200, ids=[1,2,3,4,5] (silently returns all) | ✓ | **Minor:** unrecognized filter is ignored, not rejected |
| AR8 | Dedicated pending route | Admin JWT + `GET /api/admin/restaurants/pending` | 200, only pending | 200, ids=[5] | ✓ | Duplicate of AR1 via a separate path |

### Approve / Reject Restaurant

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| AP1 | Approve pending restaurant | Admin JWT + `{"status":"approved"}` on id 3 | 200, is_verified=TRUE, rejection_reason NULL | 200; DB: is_verified=TRUE, reason=NULL | ✓ | Core approve path |
| AP2 | Reject with reason | Admin JWT + `{"status":"rejected","rejection_reason":"Missing commercial registration"}` on id 4 | 200, is_verified=FALSE, reason stored | 200; DB matches | ✓ | Core reject path |
| AP3 | Reject without reason | Admin JWT + `{"status":"rejected"}` on id 5 | 400, "rejection_reason is required" | 400; row stays pending | ✓ | Validation |
| AP4 | Approve with reason present | Admin JWT + `{"status":"approved","rejection_reason":"x"}` on id 5 | 400 (reason must be null on approve) | 400 "rejection_reason should be null when approving a restaurant" | ✓ | Hard-fails, does not silently ignore |
| AP5 | Non-existent restaurant | `PATCH …/99999/status` | 404 "Restaurant not found" | 404 | ✓ | |
| AP6 | Invalid status value | `{"status":"maybe"}` | 422 validation error | 422 enum error | ✓ | Enum enforced by Pydantic |
| AP7 | Non-admin access | Client JWT + valid body | 403 Forbidden, no change | 403 "Admin access required" | ✓ | Role enforcement |
| AP8 | No auth token | Valid body, no Authorization header | 401 Unauthorized | 401 | ✓ | |
| AP9 | Approved restaurant appears in public list | After AP1, `GET /api/restaurants` | Newly approved restaurant visible publicly | 200, id 3 present in list | ✓ | Cross-checked against public listing (RL1) after the endpoint was built |
| AP10 | Re-approve already-approved | `{"status":"approved"}` on id 3 (already approved) | idempotent 200 or 400 | 200, remains is_verified=TRUE | ✓ | Idempotent 200 |

### Resolved API-Contract Questions

- **AR7** — an unrecognized `status` filter value silently returns all restaurants
  (200), rather than rejecting with 422/400. Acceptable per spec; worth tightening to
  422 for a stricter contract if time allows (low priority).
- **AP4** — approving with a `rejection_reason` present hard-fails with 400; the
  reason is not silently ignored.
- **AP10** — re-approving an already-approved restaurant is idempotent (200); not
  treated as an invalid state transition.

---

## Public — Restaurant Browsing

`GET /api/restaurants`, `GET /api/restaurants/:id`. No auth required.

**Execution Date:** 2026-07-08
**Environment:** same server/DB as above.
**DB state at execution:** approved = ids 1 (Green Bowl), 3 (QA Pending Approve —
approved during the admin run above); rejected = ids 2, 4; pending = id 5.

### Restaurant Listing

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| RL1 | List returns only approved restaurants | `GET /api/restaurants` (DB has approved + pending + rejected) | 200, only `is_verified = TRUE` | 200, ids=[3,1] only | ✓ | |
| RL2 | Pending restaurants excluded | id 5 pending in DB, then list | 200, id 5 not in response | 200, id 5 absent | ✓ | |
| RL3 | Rejected restaurants excluded | ids 2, 4 rejected in DB, then list | 200, ids 2/4 not in response | 200, absent | ✓ | |
| RL4 | Response shape | `GET /api/restaurants` | Items have `restaurant_id`, `restaurant_name`, `description`, `logo_url` | Exactly those 4 fields | ✓ | Matches frontend contract |
| RL5 | Empty state | Temporarily set all restaurants `is_verified = FALSE`, list, restore | 200, `[]` | 200, `[]` | ✓ | Not 404/null |
| RL6 | No auth required | No Authorization header | 200, list returned | 200 | ✓ | Public browsing |
| RL7 | Rejection reason not leaked | Inspect list response | `rejection_reason` absent | Absent (response model excludes it) | ✓ | Privacy check |

### Restaurant Detail

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| RD1 | Valid approved restaurant | `GET /api/restaurants/1` | 200, details returned | 200, Green Bowl details, no `rejection_reason` field | ✓ | |
| RD2 | Non-existent restaurant | `GET /api/restaurants/99999` | 404, clear message | 404 "Restaurant not found" | ✓ | |
| RD3 | Unapproved restaurant detail | `GET /api/restaurants/2` (rejected) and `/5` (pending) | Confirm hidden vs visible | 404 for both | ✓ | Unapproved restaurants are hidden |
| RD4 | Non-numeric id | `GET /api/restaurants/abc` | 422 validation error | 422 int_parsing error | ✓ | FastAPI path param typing |

---

## Subscriptions

`POST /api/subscriptions`. Client-only.

**Execution Date:** 2026-07-09
**Test script:** [`test-subscriptions-payments.py`](test-subscriptions-payments.py) —
automated (requests + psycopg2), run with the backend venv against uvicorn on
`127.0.0.1:8000`.
**Pricing model:** fixed `original_price = 500.00` per subscription (meal-level pricing
is not in the schema yet).

**Bug found & fixed:** the expired-discount check compared a timezone-aware `NOW()`
against a naive `expires_at` in Python, returning 500 instead of 400 (SUB14). Fixed by
moving the expiry comparison into SQL.

### Creation & Validation

| # | Test Case | Expected | Actual | Pass/Fail |
|---|---|---|---|---|
| SUB1 | Valid subscription (no discount) | 200, `subscription_id` returned | 200 | ✓ |
| SUB2 | Payment row auto-created | DB `payment.payment_status = 'pending'` | 'pending' | ✓ |
| SUB3 | Valid subscription (10% discount) | 200, `discount_amount = 50.00` | 200, 50.00 | ✓ |
| SUB4 | `end_date < start_date` | 400 | 400 | ✓ |
| SUB5 | Non-existent discount code | 400 | 400 | ✓ |
| SUB6 | Missing `start_date` | 422 validation error | 422 | ✓ |
| SUB7 | No auth token | 401 | 401 | ✓ |
| SUB8 | Restaurant user creates subscription | 403 (client-only) | 403 | ✓ |

### Discount Pricing

| # | Test Case | Expected | Actual | Pass/Fail |
|---|---|---|---|---|
| SUB9 | 10% discount | 500.00 → 450.00 | 450.00 | ✓ |
| SUB10 | 25% discount | 500.00 → 375.00 | 375.00 | ✓ |
| SUB11 | No discount | 500.00 → 500.00 | 500.00 | ✓ |
| SUB12 | Discount > 100% | rejected | DB `chk_discount_percentage` blocks insert | ✓ |
| SUB13 | Inactive discount code | 400 | 400 | ✓ |
| SUB14 | Expired discount code | 400 | 400 (after bugfix, was 500) | ✓ |

---

## Payments

`POST /api/payments` initiates a payment via the **Moyasar sandbox API**
(`https://api.moyasar.com/v1/payments`); `GET /api/payments/callback` confirms it.
Because Moyasar enforces 3D Secure on card payments, the flow is two-step:

1. `POST /api/payments` (with card details) → creates the payment at Moyasar, stores
   the Moyasar payment id as `transaction_id`, returns `payment_status='pending'` +
   `transaction_url` (the 3D Secure page).
2. Customer completes 3D Secure → Moyasar redirects to `GET /api/payments/callback`,
   which re-fetches the payment status **server-to-server** (query params are never
   trusted) and marks payment `success` + subscription `confirmed` in one DB
   transaction.

**Execution Date:** 2026-07-09
**Test technique:** the suite walks Moyasar's test-mode 3D Secure pages
programmatically (prepare → authenticate → ACS emulator → set_auth_result →
acs_return), choosing `AUTHENTICATED` or `UNAUTHENTICATED`, so the full paid/failed
lifecycle runs with no manual browser step. Test card `4111111111111111`; no real
money moves. Requires a valid `MOYASAR_SECRET_KEY` (test key) in the backend `.env`
and internet access — the suite hits the real Moyasar sandbox.

### Moyasar Payment Flow

| # | Test Case | Expected | Actual | Pass/Fail |
|---|---|---|---|---|
| PAY1 | Initiate payment (valid card) | 200, 'pending' + transaction_url | 200, pending, URL returned | ✓ |
| PAY2 | Moyasar id persisted | DB `transaction_id` = Moyasar payment id, still 'pending' | matches | ✓ |
| PAY3 | Callback before 3DS | not confirmed, stays 'pending' | "Payment not completed yet (gateway status: initiated)" | ✓ |
| PAY4 | 3DS approved + callback | payment 'success' | "Payment successful. Subscription confirmed." | ✓ |
| PAY5 | DB after confirmation | payment 'success', subscription 'confirmed' | success / confirmed | ✓ |
| PAY6 | Non-existent subscription | 404 | 404 | ✓ |
| PAY7 | Not owner | 403 | 403 | ✓ |
| PAY8 | Re-pay after success | 400 | 400 "Payment is already success" | ✓ |
| PAY9 | Invalid card number | 400 (Moyasar validation) | 400 | ✓ |
| PAY10 | 3DS declined + callback | payment 'failed' | failed (gateway status verified server-side) | ✓ |
| PAY11 | Callback with unknown transaction id | 404 | 404 | ✓ |

### Transaction Atomicity

Fault injection: temporary PostgreSQL triggers raise an exception mid-transaction,
then the DB is checked for half-committed rows.

| # | Test Case | Expected | Actual | Pass/Fail |
|---|---|---|---|---|
| PAY12 | Failure during payment INSERT (subscription creation) | 500; subscription rolled back | count unchanged | ✓ |
| PAY13 | Failure mid-callback (subscription UPDATE fails after payment UPDATE) | 500; payment stays 'pending' despite Moyasar reporting 'paid' | pending (rolled back) | ✓ |
| PAY14 | No orphaned rows | subscription ↔ payment always paired | 0 orphans | ✓ |

### Resolved API-Contract Questions

- **Transaction atomicity** — the one-transaction rule is baked into the
  implementation (payment initiation is one commit; the callback's payment + subscription
  updates are another single commit) and independently verified by PAY12–PAY14.
- **Discount location** — discount/final-price calculation lives inside
  `POST /api/subscriptions`, not the payment step; SUB9–SUB11 assert against its response.
- **Re-payment (PAY8)** — implemented as 400, not idempotent 200: re-processing a
  successful payment is rejected with "Payment is already success".
- **Subscription status semantics** — the schema enum has no 'pending' status
  (`confirmed`/`cancelled` only), so `payment.payment_status` carries the pending →
  success/failed lifecycle. Per the schema's design note, clients should only be shown
  a subscription as confirmed once `payment_status = 'success'`.

---

## Outstanding Work

- Meal CRUD (`POST/PUT/DELETE /api/meals`, `GET /api/restaurants/:id/meals`) — not
  implemented yet.
- Consider tightening AR7 to return 422 on an unknown `status` filter value (optional,
  low priority).
