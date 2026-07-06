# Test Cases — Restaurants, Meals & Admin (Sprint 2)

**Project:** "qooti" Healthy Meals Subscription Platform
**Sprint:** Sprint 2 — Restaurants, Meals, and Admin (July 5 – July 11)
**Status:** Test cases authored — awaiting endpoint implementation, then execution

**Endpoints Covered:**
- `GET /api/restaurants` — list approved restaurants
- `GET /api/restaurants/:id` — single restaurant details
- `GET /api/restaurants/:id/meals` — meals for a restaurant
- `POST /api/meals` — restaurant owner adds a meal
- `PUT /api/meals/:id` — restaurant owner updates a meal
- `DELETE /api/meals/:id` — soft delete a meal
- `GET /api/admin/restaurants?status=pending` — list pending restaurants
- `GET /api/admin/restaurants` — list all restaurants with status
- `PATCH /api/admin/restaurants/:id/status` — approve/reject a restaurant

---

## How to Use This Document

For each test case, run the request (Postman or curl) and fill in the **Actual Result** and **Pass/Fail** columns. Log any failure as a GitHub Issue with a severity label (Critical / Major / Minor) and link it in the Notes column. Do not stack the plain `bug` label on top of a severity label.

**Schema reference (from `schema0.1.sql`):**
- `restaurant`: restaurant_id, user_id, restaurant_name, description, logo_url, is_verified, rejection_reason, created_at
- `meal`: meal_id, restaurant_id, name, description, ingredients (NOT NULL), calories (NOT NULL), protein_g (NOT NULL), carbs_g (NOT NULL), fats_g (NOT NULL), image_url, tags, is_available (default TRUE), created_at

> ⚠️ **Known schema/plan discrepancy:** The sprint plan lists **`price`** as a required meal field, but the `meal` table has **no `price` column**. Resolve before executing MC/MU cases (see Open Questions).

---

## 1. Restaurant Listing — `GET /api/restaurants`

Public endpoint. Must return only **approved** (`is_verified = TRUE`) restaurants.

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| RL1 | List returns only approved restaurants | `GET /api/restaurants`, DB has approved + pending + rejected | 200, array contains ONLY restaurants where `is_verified = TRUE` | | | Core acceptance test |
| RL2 | Pending restaurants excluded | Seed a pending restaurant, then list | 200, pending restaurant NOT in response | | | |
| RL3 | Rejected restaurants excluded | Seed a rejected restaurant, then list | 200, rejected restaurant NOT in response | | | |
| RL4 | Response shape | `GET /api/restaurants` | Each item has `restaurant_id`, `restaurant_name`, `description`, `logo_url` | | | Confirm field names match frontend contract |
| RL5 | Empty state | No approved restaurants in DB | 200, empty array `[]` (not 404, not null) | | | Frontend renders empty state |
| RL6 | No auth required | `GET /api/restaurants` with no Authorization header | 200, list returned | | | Public browsing |
| RL7 | Rejection reason not leaked | Approved list response | `rejection_reason` and internal fields not exposed to public | | | Privacy check |

---

## 2. Restaurant Detail — `GET /api/restaurants/:id`

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| RD1 | Valid approved restaurant | `GET /api/restaurants/1` (approved) | 200, full restaurant details returned | | | |
| RD2 | Non-existent restaurant | `GET /api/restaurants/99999` | 404, clear "not found" message | | | |
| RD3 | Unapproved restaurant detail | `GET /api/restaurants/:id` for a pending restaurant | Confirm behavior — 404/403 (hidden) vs 200 (visible) | | | See Open Questions |
| RD4 | Non-numeric id | `GET /api/restaurants/abc` | 422 validation error | | | Path param type check |

---

## 3. Restaurant Meals — `GET /api/restaurants/:id/meals`

Public endpoint for customers browsing a restaurant's menu.

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| RM1 | List meals for a restaurant | `GET /api/restaurants/1/meals` | 200, array of meals belonging to restaurant 1 | | | |
| RM2 | Unavailable meals excluded | Restaurant has a meal with `is_available = FALSE` | 200, that meal NOT in response | | | Ties to soft-delete (MD1) |
| RM3 | Meal nutritional fields present | `GET /api/restaurants/1/meals` | Each meal has name, ingredients, calories, protein_g, carbs_g, fats_g, tags, image_url | | | Full detail per plan |
| RM4 | Restaurant with no meals | `GET /api/restaurants/:id/meals` for restaurant with 0 meals | 200, empty array `[]` | | | |
| RM5 | Non-existent restaurant | `GET /api/restaurants/99999/meals` | 404 (or 200 + empty) — confirm expected | | | See Open Questions |
| RM6 | Meals scoped to restaurant | Restaurant 1 and 2 both have meals | Response for `/1/meals` contains ONLY restaurant 1's meals | | | Isolation check |

---

## 4. Create Meal — `POST /api/meals`

Restaurant-owner only. Meal must be linked to the authenticated owner's restaurant.

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| MC1 | Valid meal creation | Restaurant-owner JWT + full valid payload (name, ingredients, calories, protein_g, carbs_g, fats_g) | 201/200, new row in `meal`, `is_available = TRUE` | | | Happy path |
| MC2 | Missing name | Payload without `name` | 422 validation error, no row created | | | NOT NULL field |
| MC3 | Missing ingredients | Payload without `ingredients` | 422 validation error, no row created | | | NOT NULL field |
| MC4 | Missing calories | Payload without `calories` | 422 validation error, no row created | | | NOT NULL field |
| MC5 | Missing protein_g | Payload without `protein_g` | 422 validation error, no row created | | | NOT NULL field |
| MC6 | Missing carbs_g | Payload without `carbs_g` | 422 validation error, no row created | | | NOT NULL field |
| MC7 | Missing fats_g | Payload without `fats_g` | 422 validation error, no row created | | | NOT NULL field |
| MC8 | Negative calories | `calories: -100` | 400/422 error, no row created | | | Business rule (cf. R15 age bug) |
| MC9 | Negative macro value | `protein_g: -5` | 400/422 error, no row created | | | |
| MC10 | Macro exceeds DECIMAL(5,2) | `protein_g: 100000` | 422/400 error | | | Column is DECIMAL(5,2), max 999.99 |
| MC11 | Optional fields omitted | Valid payload without description, image_url, tags | 201/200, meal created, optional columns NULL | | | |
| MC12 | Non-restaurant user (client) | Client JWT + valid meal payload | 403 Forbidden, no row created | | | Role enforcement |
| MC13 | No auth token | Valid payload, no Authorization header | 401 Unauthorized | | | |
| MC14 | Admin user creating meal | Admin JWT + valid payload | Confirm expected — 403 (admins don't own restaurants) | | | See Open Questions |
| MC15 | Meal linked to owner's restaurant | Owner A creates meal; payload attempts `restaurant_id` of restaurant B | Meal linked to A's own restaurant, NOT B (server derives restaurant_id from token) | | | Ownership / IDOR guard |
| MC16 | Owner of unapproved restaurant | Owner whose restaurant `is_verified = FALSE` creates meal | Confirm expected — allowed or blocked until approval | | | See Open Questions |
| MC17 | `price` field handling | Payload includes `price` (per sprint plan) | Confirm behavior once price is added to schema, or field ignored | | | ⚠️ schema/plan discrepancy |
| MC18 | SQL injection in text field | `name: "'; DROP TABLE meal;--"` | Stored as literal string, table intact | | | Parameterized-query check |

---

## 5. Update Meal — `PUT /api/meals/:id`

Restaurant-owner only. Owner may update only their own meals.

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| MU1 | Owner updates own meal | Owner JWT + `PUT /api/meals/1` with new name + calories | 200, meal row updated in DB | | | Happy path |
| MU2 | Update reflected in DB | After MU1, query meal 1 | Updated values persisted | | | Verify write |
| MU3 | Non-existent meal | `PUT /api/meals/99999` | 404, no update | | | |
| MU4 | Owner updates another restaurant's meal | Owner A JWT + `PUT` on meal belonging to restaurant B | 403 Forbidden, no update | | | Ownership guard |
| MU5 | No auth token | `PUT /api/meals/1` no token | 401 Unauthorized | | | |
| MU6 | Non-restaurant user | Client JWT + `PUT /api/meals/1` | 403 Forbidden | | | Role enforcement |
| MU7 | Partial update | Payload with only `name` | 200, only name changed, other fields unchanged | | | Confirm partial vs full-replace semantics |
| MU8 | Invalid value on update | `calories: -50` | 400/422 error, no update | | | |
| MU9 | Non-numeric id | `PUT /api/meals/abc` | 422 validation error | | | |

---

## 6. Delete Meal (Soft Delete) — `DELETE /api/meals/:id`

Must set `is_available = FALSE` — the row is NOT physically removed.

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| MD1 | Soft delete sets is_available=false | Owner JWT + `DELETE /api/meals/1` | 200, `meal.is_available = FALSE`, row still present in DB | | | Core acceptance test |
| MD2 | Deleted meal hidden from menu | After MD1, `GET /api/restaurants/1/meals` | Meal 1 NOT in response | | | Ties to RM2 |
| MD3 | Row not physically deleted | After MD1, `SELECT * FROM meal WHERE meal_id = 1` | Row still exists with is_available=FALSE | | | Confirm NOT a hard delete |
| MD4 | Non-existent meal | `DELETE /api/meals/99999` | 404 | | | |
| MD5 | Owner deletes another restaurant's meal | Owner A JWT + `DELETE` on restaurant B's meal | 403 Forbidden, no change | | | Ownership guard |
| MD6 | No auth token | `DELETE /api/meals/1` no token | 401 Unauthorized | | | |
| MD7 | Non-restaurant user | Client JWT + `DELETE /api/meals/1` | 403 Forbidden | | | Role enforcement |
| MD8 | Delete already-deleted meal | `DELETE` a meal already is_available=FALSE | 200 idempotent (or 404) — confirm expected | | | See Open Questions |

---

## 7. Admin — List Restaurants

`GET /api/admin/restaurants` and `GET /api/admin/restaurants?status=pending`. Admin-only.

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| AR1 | List pending restaurants | Admin JWT + `?status=pending` | 200, only restaurants with is_verified=FALSE AND rejection_reason IS NULL | | | Already implemented in `admin_routes.py` |
| AR2 | List all restaurants | Admin JWT + `GET /api/admin/restaurants` | 200, all restaurants with is_verified + rejection_reason | | | |
| AR3 | Filter approved | Admin JWT + `?status=approved` | 200, only is_verified=TRUE | | | |
| AR4 | Filter rejected | Admin JWT + `?status=rejected` | 200, only is_verified=FALSE AND rejection_reason IS NOT NULL | | | |
| AR5 | Non-admin access | Restaurant/client JWT | 403 Forbidden | | | Role enforcement |
| AR6 | No auth token | No Authorization header | 401 Unauthorized | | | |
| AR7 | Invalid status filter | `?status=banana` | Confirm — 422, 400, or ignored/returns all | | | See Open Questions |

---

## 8. Admin — Approve / Reject Restaurant

`PATCH /api/admin/restaurants/:id/status`. Admin-only.

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| AP1 | Approve pending restaurant | Admin JWT + `{"status":"approved"}` on pending restaurant | 200, `is_verified = TRUE`, `rejection_reason` stays NULL | | | Already implemented |
| AP2 | Reject with reason | Admin JWT + `{"status":"rejected","rejection_reason":"Missing documents"}` | 200, `is_verified = FALSE`, reason stored in DB | | | |
| AP3 | Reject without reason | Admin JWT + `{"status":"rejected"}` | 400, "rejection_reason is required when rejecting" | | | Validation |
| AP4 | Approve with reason present | Admin JWT + `{"status":"approved","rejection_reason":"x"}` | 400 error (reason must be null on approve) | | | Confirm current impl behavior |
| AP5 | Non-existent restaurant | `PATCH /api/admin/restaurants/99999/status` | 404 "Restaurant not found" | | | |
| AP6 | Invalid status value | `{"status":"maybe"}` | 422 validation error | | | Enum: approved/rejected |
| AP7 | Non-admin access | Restaurant/client JWT + valid body | 403 Forbidden, no change | | | Role enforcement |
| AP8 | No auth token | Valid body, no Authorization header | 401 Unauthorized | | | |
| AP9 | Approved restaurant appears in public list | After AP1, `GET /api/restaurants` | Newly approved restaurant now visible publicly | | | End-to-end with RL1 |
| AP10 | Re-approve / status change | Approve an already-approved restaurant | Confirm expected — idempotent 200 or 400 | | | See Open Questions |

---

## Open Questions for Backend

- **RD3 / RM5:** For a pending or non-existent restaurant, should detail/meals endpoints return 404, 403, or 200 with empty data?
- **MC14:** Can an `admin` user create meals, or is meal creation strictly for `restaurant` owners (403 for admin)?
- **MC16:** Can a restaurant owner add meals while their restaurant is still pending/unapproved, or is menu management blocked until approval?
- **MC17 / price:** The sprint plan lists `price` as a required meal field, but the `meal` table has no `price` column. Should `price` be added to the schema, or is it out of scope for meals?
- **MD8:** Deleting an already soft-deleted meal — idempotent 200 or 404?
- **AR7:** Unrecognized `status` filter value — 422, 400, or silently return all?
- **AP4:** Confirm whether approving with a `rejection_reason` present should hard-fail (400) or silently ignore the reason.
- **AP10:** Should approving an already-approved (or re-rejecting a rejected) restaurant be idempotent, or rejected as an invalid state transition?

---

## Test Data Prerequisites

Before executing, seed / prepare:
- 1 approved restaurant with ≥ 2 available meals
- 1 pending restaurant (is_verified=FALSE, rejection_reason=NULL)
- 1 rejected restaurant (is_verified=FALSE, rejection_reason set)
- 1 restaurant-owner account (JWT for POST/PUT/DELETE meal tests)
- 1 second restaurant-owner account (for ownership/cross-owner 403 tests)
- 1 client account (for role-enforcement 403 tests)
- 1 admin account (`admin@qooti_admin.com`) for admin endpoints

## Notes

- Admin endpoints (Section 7 & 8) are already implemented in `BACKEND/project/backend/routes/admin_routes.py` and passed an initial smoke test; the cases here formalize full coverage for a proper QA pass.
- Restaurant/meal endpoints (Sections 1–6) are Member 2's Sprint 2 backend tasks and are **not yet implemented** — these cases are ready to run once the endpoints land.
- Severity guidance for logged bugs: **Critical** = auth bypass / data loss / cross-owner access; **Major** = wrong status code or invalid data accepted; **Minor** = message wording / cosmetic.
