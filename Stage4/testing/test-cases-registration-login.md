# Test Cases — Registration and Login Flows

**Project:** Healthy Meals Subscription Platform
**Sprint:** Sprint 1 — Setup and Authentication
**Owner:** Badryah Almalki (QA Lead + Database)
**Endpoints Covered:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`

---

## How to Use This Document

For each test case below, run the request (e.g. via Postman) and fill in the **Actual Result** and **Pass/Fail** columns. Any failure should be logged as a GitHub Issue with the appropriate severity label (Critical / Major / Minor) and linked in the notes column.

---

## 1. Registration — `POST /api/auth/register`

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| R1 | Valid client registration | Full valid payload with `user_type: "client"` + all health fields | 201/200, `{"message": "User registered successfully"}`, new row in `app_user` | | | |
| R2 | Valid restaurant registration | `user_type: "restaurant"`, no health fields | 201/200, success message, health/address columns NULL in DB | | | |
| R3 | Duplicate email | Email already exists in `app_user` | 409/400 error, no new row created (violates `uq_app_user_email`) | | | |
| R4 | Missing required field (email) | Payload missing `email` | 400 error, clear validation message, no row created | | | |
| R5 | Missing required field (password) | Payload missing `password` | 400 error, no row created | | | |
| R6 | Missing required field (full_name) | Payload missing `full_name` | 400 error, no row created | | | |
| R7 | Invalid email format | `email: "not-an-email"` | 400 error, no row created | | | |
| R8 | Weak/empty password | `password: ""` or too short | 400 error, no row created | | | |
| R9 | Client missing health fields | `user_type: "client"`, health fields omitted | 400 error (health profile required for clients) | | | |
| R10 | Restaurant with health fields included | `user_type: "restaurant"` but health fields sent anyway | Fields should be ignored or rejected — confirm expected behavior with backend | | | Needs confirmation from Moudhi |
| R11 | Invalid user_type value | `user_type: "manager"` (not in enum) | 400 error, no row created | | | |
| R12 | Invalid gender value | `gender: "other"` (not in enum: male/female) | 400 error, no row created | | | |
| R13 | Invalid health_goal value | `health_goal: "shred"` (not in enum) | 400 error, no row created | | | |
| R14 | Password is hashed, not stored in plaintext | Any valid registration | `password_hash` column ≠ raw password sent | | | |
| R15 | Age/height/weight as negative or zero | `age: -5` or `weight_kg: 0` | 400 error, no row created | | | |
| R16 | Extra/unexpected fields in payload | Valid payload + random extra field | Extra field ignored, registration still succeeds | | | |
| R17 | SQL injection attempt in text fields | `full_name: "'; DROP TABLE app_user;--"` | Registration fails safely or stores as literal string, table remains intact | | | Basic security check, not full pentest |

---

## 2. Login — `POST /api/auth/login`

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| L1 | Valid client login | Correct email + password for existing client | 200, JWT token returned + user role `client` | | | |
| L2 | Valid restaurant login | Correct email + password for existing restaurant user | 200, JWT token + role `restaurant` | | | |
| L3 | Valid admin login | Correct email + password for admin user | 200, JWT token + role `admin` | | | |
| L4 | Wrong password | Correct email, incorrect password | 401 error, no token returned | | | |
| L5 | Non-existent email | Email not in `app_user` table | 401/404 error, no token returned | | | |
| L6 | Missing email field | Payload missing `email` | 400 error | | | |
| L7 | Missing password field | Payload missing `password` | 400 error | | | |
| L8 | Deactivated account login attempt | `is_active = FALSE` for that user | Login rejected, appropriate error message | | | Needs confirmation on expected error message |
| L9 | Case sensitivity on email | Registered with `Reem@example.com`, login with `reem@example.com` | Confirm expected behavior — should likely still succeed | | | Needs confirmation from Moudhi |
| L10 | Token contains correct role/user info | Any successful login | Decode JWT, verify `user_id` and `role` are correct and match DB | | | |

---

## 3. Logout — `POST /api/auth/logout`

| # | Test Case | Input Summary | Expected Result | Actual Result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| O1 | Valid logout with active token | Valid JWT in request | 200 success response | | | |
| O2 | Logout without token | No Authorization header | 401 error | | | |
| O3 | Logout with invalid/expired token | Malformed or expired JWT | 401 error | | | |
| O4 | Token invalidated after logout (if applicable) | Use same token again after logout | Confirm expected behavior — depends on whether logout blacklists tokens or is client-side only | | | Needs confirmation from Moudhi |

---

## Open Questions for Backend

- **R10:** Should health fields sent for a `restaurant` registration be ignored or rejected? 
- **L8:** What error message/status should a deactivated account receive on login?
- **L9:** Is email login case-insensitive?
- **O4:** Does logout invalidate the JWT server-side, or is it purely client-side (token just discarded)?
