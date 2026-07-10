# Test Results — Admin Restaurant Management

**Project:** "qooti" Healthy Meals Subscription Platform
**Sprint:** Sprint 2 — Restaurants, Meals, and Admin (July 5 – July 11)
**Execution Date:** 2026-07-07
**Spec document:** [`test-cases-restaurants-meals.md`](test-cases-restaurants-meals.md)
**Scope of this run (Group B):** Admin restaurant management — Sections 7 & 8
(`GET /api/admin/restaurants`, `GET /api/admin/restaurants?status=…`,
`PATCH /api/admin/restaurants/:id/status`).

---

## Test Execution Summary

**Executed:** 16 cases
**Passed:** 16
**Failed:** 0
**Pass Rate (of executed):** 100%
**Bugs Found:** 0 

---

## Test Environment

- **Server:** FastAPI (`uvicorn main:app`) on `127.0.0.1:8000`, from
  `BACKEND/project/backend/`.
- **Database:** PostgreSQL `healthy_meals_db` (schema `schema0.1.sql` + `seed.sql`).
- **Auth:** Registered a fresh admin (`qa.admin@qooti_admin.com`) — the seeded admin
  row carries a placeholder password hash and cannot log in. Registered a client
  (`qa.client@example.com`) for role-enforcement cases.
- **Test data seeded** (3 pending restaurants, since the seed set has none pending):
  - `restaurant_id = 3` "QA Pending Approve"  → used by AP1, AP10
  - `restaurant_id = 4` "QA Pending Reject"   → used by AP2
  - `restaurant_id = 5` "QA Pending Negatives" → stays pending, used by AP3–AP8
- **Pre-existing seed rows:** `id 1` Green Bowl (approved), `id 2` Fit Kitchen (rejected).

> **Fix required to run:** the committed route file was named `admin_routes.py<U+200E>`
> (trailing invisible left-to-right mark), so `from routes.admin_routes import …` in
> `main.py` raised `ModuleNotFoundError` and the server would not boot. Renamed to a
> clean `admin_routes.py`. This is included in the Group B commit.

---

## 7. Admin — List Restaurants

`GET /api/admin/restaurants` and `?status=…`. Admin-only.

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| AR1 | List pending restaurants | Admin JWT + `?status=pending` | 200, only is_verified=FALSE AND rejection_reason IS NULL | 200, ids=[5] (only pending) | ✓ | |
| AR2 | List all restaurants | Admin JWT + `GET /api/admin/restaurants` | 200, all restaurants | 200, ids=[1,2,3,4,5] | ✓ | Ordered by created_at DESC |
| AR3 | Filter approved | Admin JWT + `?status=approved` | 200, only is_verified=TRUE | 200, ids=[1,3] | ✓ | |
| AR4 | Filter rejected | Admin JWT + `?status=rejected` | 200, only is_verified=FALSE AND reason NOT NULL | 200, ids=[2,4] | ✓ | |
| AR5 | Non-admin access | Client JWT | 403 Forbidden | 403 "Admin access required" | ✓ | Role enforcement |
| AR6 | No auth token | No Authorization header | 401 Unauthorized | 401 "Missing or invalid authorization header" | ✓ | |
| AR7 | Invalid status filter | `?status=banana` | 422 / 400 / or ignored → all | 200, ids=[1,2,3,4,5] (silently returns all) | ✓ | **Minor:** unrecognized filter is ignored, not rejected. Acceptable per spec but consider 422 for stricter contract. Resolves open question AR7. |
| — | (bonus) dedicated pending route | Admin JWT + `GET /api/admin/restaurants/pending` | 200, only pending | 200, ids=[5] | ✓ | Duplicate of AR1 via a separate path |

---

## 8. Admin — Approve / Reject Restaurant

`PATCH /api/admin/restaurants/:id/status`. Admin-only.

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| AP1 | Approve pending restaurant | Admin JWT + `{"status":"approved"}` on id 3 | 200, is_verified=TRUE, rejection_reason NULL | 200; DB: is_verified=TRUE, reason=NULL | ✓ | **Task 7** — core approve path |
| AP2 | Reject with reason | Admin JWT + `{"status":"rejected","rejection_reason":"Missing commercial registration"}` on id 4 | 200, is_verified=FALSE, reason stored | 200; DB: is_verified=FALSE, reason="Missing commercial registration" | ✓ | **Task 8** — core reject path |
| AP3 | Reject without reason | Admin JWT + `{"status":"rejected"}` on id 5 | 400, "rejection_reason is required" | 400 "rejection_reason is required when rejecting a restaurant"; row stays pending | ✓ | Validation |
| AP4 | Approve with reason present | Admin JWT + `{"status":"approved","rejection_reason":"x"}` on id 5 | 400 (reason must be null on approve) | 400 "rejection_reason should be null when approving a restaurant" | ✓ | Resolves open question AP4 (hard-fails, does not ignore) |
| AP5 | Non-existent restaurant | `PATCH …/99999/status` | 404 "Restaurant not found" | 404 "Restaurant not found" | ✓ | |
| AP6 | Invalid status value | `{"status":"maybe"}` | 422 validation error | 422 enum error "Input should be 'approved' or 'rejected'" | ✓ | Enum enforced by Pydantic |
| AP7 | Non-admin access | Client JWT + valid body | 403 Forbidden, no change | 403 "Admin access required" | ✓ | Role enforcement |
| AP8 | No auth token | Valid body, no Authorization header | 401 Unauthorized | 401 "Missing or invalid authorization header" | ✓ | |
| AP9 | Approved restaurant appears in public list | After AP1, `GET /api/restaurants` | Newly approved restaurant visible publicly | **BLOCKED** — `GET /api/restaurants` not implemented (Group A) | — | DB precondition holds (id 3 is_verified=TRUE); re-run with Group A |
| AP10 | Re-approve already-approved | `{"status":"approved"}` on id 3 (already approved) | idempotent 200 or 400 | 200, remains is_verified=TRUE | ✓ | Resolves open question AP10 — behavior is **idempotent 200** |

---

## Resolved Open Questions

- **AR7** — Unrecognized `status` filter value: implementation **silently returns all**
  restaurants (200), it does not reject with 422/400. Logged as a minor contract note.
- **AP4** — Approving with a `rejection_reason` present **hard-fails with 400**; the
  reason is not silently ignored.
- **AP10** — Re-approving an already-approved restaurant is **idempotent (200)**; it is
  not treated as an invalid state transition.

## Follow-ups

- **AP9** must be re-run once Group A ships `GET /api/restaurants` (end-to-end approval →
  public visibility). Pairs with case RL1.
- Consider tightening AR7 to return 422 on an unknown `status` value for a stricter API
  contract (optional; low priority).
- Sections 1–6 (public restaurant + meal endpoints) remain awaiting implementation.

---

# Public Restaurant Endpoints

**Execution Date:** 2026-07-08
**Scope:** `GET /api/restaurants`, `GET /api/restaurants/:id`
(implemented in `BACKEND/project/backend/routes/restaurant_routes.py`).

**Environment:** run (uvicorn on `127.0.0.1:8000`, `healthy_meals_db`).


## Test Execution Summary

**Executed:** 12 cases
**Passed:** 12 · **Failed:** 0 · **Pass Rate:** 100%
**Bugs Found:** 0

## 1. Restaurant Listing — `GET /api/restaurants`

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| RL1 | List returns only approved restaurants | `GET /api/restaurants` (DB has approved + pending + rejected) | 200, only `is_verified = TRUE` | 200, ids=[3,1] only | ✓ | Core acceptance test |
| RL2 | Pending restaurants excluded | id 5 pending in DB, then list | 200, id 5 not in response | 200, id 5 absent | ✓ | |
| RL3 | Rejected restaurants excluded | ids 2, 4 rejected in DB, then list | 200, ids 2/4 not in response | 200, ids 2 and 4 absent | ✓ | |
| RL4 | Response shape | `GET /api/restaurants` | Items have `restaurant_id`, `restaurant_name`, `description`, `logo_url` | Exactly those 4 fields per item | ✓ | Matches frontend contract |
| RL5 | Empty state | Temporarily set all restaurants `is_verified = FALSE`, list, restore | 200, `[]` | 200, `[]` (data restored after) | ✓ | Not 404/null |
| RL6 | No auth required | No Authorization header | 200, list returned | 200 | ✓ | Public browsing |
| RL7 | Rejection reason not leaked | Inspect list response | `rejection_reason` absent | Absent (response model excludes it) | ✓ | Privacy check |

## 2. Restaurant Detail — `GET /api/restaurants/:id`

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| RD1 | Valid approved restaurant | `GET /api/restaurants/1` | 200, details returned | 200, Green Bowl details, no `rejection_reason` field | ✓ | |
| RD2 | Non-existent restaurant | `GET /api/restaurants/99999` | 404, clear message | 404 "Restaurant not found" | ✓ | |
| RD3 | Unapproved restaurant detail | `GET /api/restaurants/2` (rejected) and `/5` (pending) | Confirm hidden vs visible | 404 for both — unapproved restaurants are hidden | ✓ | Resolves open question RD3: **404 (hidden)** |
| RD4 | Non-numeric id | `GET /api/restaurants/abc` | 422 validation error | 422 int_parsing error | ✓ | FastAPI path param typing |

## 8 (re-run). AP9 — End-to-end approval → public visibility

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| AP9 | Approved restaurant appears in public list | id 3 approved in Group B run; `GET /api/restaurants` | id 3 visible publicly | 200, id 3 present in list | ✓ | Unblocked by Group A; pairs with RL1 |

---

# Subscriptions & Payments 

**Execution Date:** 2026-07-08
**Scope:** `POST /api/subscriptions`,
`POST /api/payments` (implemented in `BACKEND/project/backend/routes/subscription_routes.py`
and `payment_routes.py`).
**Test script:** run with the backend venv against uvicorn on `127.0.0.1:8000`.
**Pricing model:** fixed `original_price = 500.00` per subscription (sprint-plan
Option A — meal prices are not in the schema yet).

## Test Execution Summary

**Executed:** 23 cases 
**Passed:** 23 · **Failed:** 0 · **Pass Rate:** 100%
**Bugs Found & Fixed:** 1 — expired-discount check compared a timezone-aware `NOW()`
against a naive `expires_at` in Python, returning 500 instead of 400 (T10.6). Fixed by
moving the expiry comparison into SQL.

## Task 9 — `POST /api/subscriptions` creates subscription correctly

| # | Test Case | Expected | Actual | Pass/Fail |
|---|---|---|---|---|
| T9.1 | Valid subscription (no discount) | 200, `subscription_id` returned | 200 | ✓ |
| T9.2 | Payment row auto-created | DB `payment.payment_status = 'pending'` | 'pending' | ✓ |
| T9.3 | Valid subscription (10% discount) | 200, `discount_amount = 50.00` | 200, 50.00 | ✓ |
| T9.4 | `end_date < start_date` | 400 | 400 | ✓ |
| T9.5 | Non-existent discount code | 400 | 400 | ✓ |
| T9.6 | Missing `start_date` | 422 validation error | 422 | ✓ |
| T9.7 | No auth token | 401 | 401 | ✓ |
| T9.8 | Restaurant user creates subscription | 403 (client-only) | 403 | ✓ |

## Task 10 — Discount code reduces final price correctly

| # | Test Case | Expected | Actual | Pass/Fail |
|---|---|---|---|---|
| T10.1 | 10% discount | 500.00 → 450.00 | 450.00 | ✓ |
| T10.2 | 25% discount | 500.00 → 375.00 | 375.00 | ✓ |
| T10.3 | No discount | 500.00 → 500.00 | 500.00 | ✓ |
| T10.4 | Discount > 100% | rejected | DB `chk_discount_percentage` blocks insert | ✓ |
| T10.5 | Inactive discount code | 400 | 400 | ✓ |
| T10.6 | Expired discount code | 400 | 400 (after bugfix, was 500) | ✓ |

## Task 11 — `POST /api/payments` confirms subscription status

| # | Test Case | Expected | Actual | Pass/Fail |
|---|---|---|---|---|
| T11.1 | Process payment for pending subscription | 200, status 'success' | 200, 'success' | ✓ |
| T11.2 | Payment status transition | DB 'pending' → 'success' | 'success' | ✓ |
| T11.3 | Subscription status after payment | 'confirmed' | 'confirmed' | ✓ |
| T11.4 | Non-existent subscription | 404 | 404 | ✓ |
| T11.5 | Subscription not owned by user | 403 | 403 | ✓ |
| T11.6 | Re-process already-successful payment | idempotent or 400? | **400** "Payment is already success" | ✓ |

## Task 12 — Transaction atomicity

Fault injection: temporary PostgreSQL triggers raise an exception mid-transaction,
then the DB is checked for half-committed rows.

| # | Test Case | Expected | Actual | Pass/Fail |
|---|---|---|---|---|
| T12.1 | Failure during payment INSERT (mid-subscription-creation) | 500; subscription NOT in DB | 500; subscription count unchanged (rolled back) | ✓ |
| T12.2 | Failure during subscription UPDATE (mid-payment-processing) | 500; payment stays 'pending' | 500; payment still 'pending' (rolled back) | ✓ |
| T12.3 | No orphaned rows | every subscription ↔ payment paired | 0 orphans both directions | ✓ |
