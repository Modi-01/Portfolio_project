# Test Results — Admin Restaurant Management (Sprint 2)

**Project:** "qooti" Healthy Meals Subscription Platform
**Sprint:** Sprint 2 — Restaurants, Meals, and Admin (July 5 – July 11)
**Execution Date:** 2026-07-07
**Spec document:** [`test-cases-restaurants-meals.md`](test-cases-restaurants-meals.md)
**Scope of this run (Group B):** Admin restaurant management — Sections 7 & 8
(`GET /api/admin/restaurants`, `GET /api/admin/restaurants?status=…`,
`PATCH /api/admin/restaurants/:id/status`).

---

## Test Execution Summary

**Executed:** 16 cases (Section 7: AR1–AR7 + bonus; Section 8: AP1–AP8, AP10)
**Passed:** 16
**Failed:** 0
**Blocked:** 1 (AP9 — depends on `GET /api/restaurants`, a Group A task not yet built)
**Pass Rate (of executed):** 100%

**Bugs Found:** 0 (1 minor observation logged — see AR7)

Sections 1–6 (public restaurant + meal endpoints) were **not executed** — those
endpoints are not implemented yet (Group A / Member 2 backend work).

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
