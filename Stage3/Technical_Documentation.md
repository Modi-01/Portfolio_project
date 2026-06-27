# Healthy Meals Subscription Platform
## Stage 3 — Technical Documentation
**Holberton School — Final Project | June 2026**

## Table of Contents

- [0. User Stories and Mockups](#0-user-stories-and-mockups)
- [1. System Architecture](#1-system-architecture)
- [2. Components, Classes, and Database Design](#2-components-classes-and-database-design)
  - [2.1 Backend Classes](#21-backend-classes)
  - [2.2 Frontend Components](#22-frontend-components)
  - [2.3 Table Definitions](#23-table-definitions)
  - [2.4 Relationships](#24-relationships)
  - [2.5 Key Design Decisions](#25-key-design-decisions)
- [3. High-Level Sequence Diagrams](#3-high-level-sequence-diagrams)
- [4. External and Internal APIs](#4-external-and-internal-apis)
- [5. SCM and QA Strategies](#5-scm-and-qa-strategies)

---

## 0. User Stories and Mockups

User stories were prioritized using the MoSCoW method across all three user types: Customer, Restaurant, and Admin. Mockups for the main screens were created using Google Stitch and exported to Figma.

### 0.1 Customer

| Priority | User Story |
|---|---|
| Must Have | As a customer, I want to create an account by entering my personal and health-related information, so that the platform can save my profile and subscription details. |
| Must Have | As a customer, I want to view available healthy meals from different restaurants, so that I can choose meals based on my preferences. |
| Must Have | As a customer, I want to select one lunch meal for each day of the subscription week, so that I can prepare my weekly meal plan in advance. |
| Must Have | As a customer, I want to review my selected meals before submitting the order, so that I can confirm my weekly choices. |
| Must Have | As a customer, I want to submit my weekly meal order and pay, so that my subscription is confirmed and the restaurant can prepare my meals. |
| Must Have | As a customer, I want to complete payment for my subscription, so that my order is confirmed. |
| Should Have | As a customer, I want to add my preferred delivery time and address, so that the restaurant can prepare the delivery properly. |
| Should Have | As a customer, I want to apply a discount code, so that I can pay using a company discount. |
| Could Have | As a customer, I want to see calories and macronutrients for each meal, so that I can choose meals that match my health goal. |
| Could Have | As a customer, I want to leave a review after my subscription week ends, so that I can share my experience with other users. |
| Could Have | As a customer, I want to view meal or restaurant ratings, so that I can make better choices. |

### 0.2 Restaurant

| Priority | User Story |
|---|---|
| Must Have | As a restaurant owner, I want to log in to my restaurant account, so that I can manage my restaurant meals. |
| Must Have | As a restaurant owner, I want to add new meals with image, name, ingredients, calories, and macronutrients, so that customers can view complete meal details. |
| Must Have | As a restaurant owner, I want to update meal information, so that I can keep the weekly menu accurate. |
| Must Have | As a restaurant owner, I want to delete unavailable meals, so that customers do not select meals that cannot be prepared. |
| Must Have | As a restaurant owner, I want to view customer meal selections, so that I can prepare weekly orders in advance. |
| Should Have | As a restaurant owner, I want to see orders grouped by day, so that meal preparation becomes easier. |

### 0.3 Admin

| Priority | User Story |
|---|---|
| Must Have | As an admin, I want to review restaurant registration information, so that I can ensure only eligible restaurants join the platform. |
| Must Have | As an admin, I want to manage restaurant accounts, so that I can approve or reject restaurants. |
| Should Have | As an admin, I want to view basic platform data, so that I can monitor restaurants, customers, and orders. |

### 0.4 Mockups

Mockups for all main screens were created using Google Stitch and exported to Figma.

**Figma link:** [View All Mockups on Figma](https://www.figma.com/design/eZ6CPzYEFMObYFsVxw9SGg/Untitled?node-id=0-1&t=5Aa4UiFYLHYaWs78-1)

---

## 1. System Architecture

The Healthy Meals Subscription Platform follows a Three-Tier Architecture to ensure scalability, maintainability, and efficient data management. The system consists of a Front-End layer, a Back-End layer, and a Database layer.

### 1.1 Technologies Used

| Layer | Technology |
|---|---|
| Front-End | React.js |
| Back-End | Python + FastAPI |
| Database | PostgreSQL |
| Authentication | JWT Authentication (PyJWT) |
| API Testing | Postman |
| Version Control | GitHub |
| Task Tracking | Trello |

### 1.2 Architecture Diagram

![High-Level Architecture Diagram](<./assets/High-Level Architecture Diagram.png>)

### 1.3 Data Flow

#### Registration and login
The user registers or logs in via the React front-end. The front-end sends a POST request to the Authentication API. The back-end validates the data, hashes the password, and stores or retrieves the record from the `app_user` table. A JWT token is returned to the client for secure access.

#### Browse restaurants
The front-end sends `GET /api/restaurants` to the back-end, which queries the `restaurant` table for verified restaurants only and returns the list as JSON.

#### Browse meals
When a restaurant is selected, the front-end sends `GET /api/meals/:restaurantId`. The back-end retrieves available meals from the `meal` table for that restaurant.

#### Create weekly subscription
The client selects one meal per working day, enters delivery details, and optionally applies a discount code. The front-end sends `POST /api/subscriptions`. The back-end inserts one row into the `subscription` table and five rows into the `order_item` table in a single transaction.

#### Update delivery address
The client updates their saved home or work address via `PATCH /api/users/:userId`. The back-end updates the corresponding columns in the `app_user` table.

#### Process payment
After the client confirms their meal selections, the front-end sends `POST /api/payments` to the back-end. The back-end creates a `payment` row with `payment_status = 'pending'`, communicates with the Payment Gateway API, and updates the row to `'success'` or `'failed'` based on the response. The subscription is confirmed to the client only on success.

#### Submit a review
After a confirmed subscription week, the client submits a rating and optional comment via `POST /api/reviews`. The back-end verifies that the `order_item_id` belongs to the authenticated client and that the subscription is confirmed before inserting the review row. Meal ratings are readable by any user via `GET /api/reviews/meal/:mealId`.

#### Admin dashboard
The admin views pending restaurant registrations via `GET /api/admin/restaurants` and approves or rejects them via `PATCH /api/admin/restaurants/:restaurantId/status`, updating the `is_verified` and `rejection_reason` columns in the `restaurant` table.

### 1.4 Architecture Design Decisions

| Decision | Reason |
|---|---|
| React.js | Provides a modern and responsive user interface |
| Python + FastAPI | High-performance framework for building RESTful APIs with automatic API documentation and excellent scalability |
| PostgreSQL | Reliable relational database for structured data |
| JWT Authentication (PyJWT) | Secure user authentication and authorization |
| REST APIs | Standard communication between Front-End and Back-End |
| Three-Tier Architecture | Improves scalability, maintainability, and security |

---

## 2. Components, Classes, and Database Design

### 2.1 Backend Classes

The backend is organized around eight core classes, each corresponding to a database entity. Each class is handled by a dedicated module in the Python/FastAPI backend (router + service).

---

**User**

Manages all platform users across three types: client, restaurant, and admin.

| | |
|---|---|
| **Attributes** | user_id, user_type, full_name, email, password_hash, phone, is_active, age, gender, height_cm, weight_kg, health_goal, home_address, work_address, created_at |
| **Methods** | register(), login(), getUserById(), updateDeliveryAddress(), deactivateAccount() |

---

**Restaurant**

Represents a restaurant business entity linked to a user account. Controlled by admin verification.

| | |
|---|---|
| **Attributes** | restaurant_id, user_id, restaurant_name, description, logo_url, is_verified, rejection_reason, created_at |
| **Methods** | createRestaurant(), getVerifiedRestaurants(), getRestaurantByUserId(), updateStatus() |

---

**Meal**

Stores meals offered by each restaurant including nutritional data and availability.

| | |
|---|---|
| **Attributes** | meal_id, restaurant_id, name, description, ingredients, calories, protein_g, carbs_g, fats_g, image_url, tags, is_available, created_at |
| **Methods** | createMeal(), getMealsByRestaurant(), updateMeal(), softDeleteMeal() |

---

**Subscription**

Records a client's weekly lunch subscription including pricing and delivery preferences.

| | |
|---|---|
| **Attributes** | subscription_id, user_id, discount_code_id, start_date, end_date, delivery_time, delivery_address, original_price, discount_amount, final_price, status, is_renewed, created_at |
| **Methods** | createSubscription(), getSubscriptionsByUser(), cancelSubscription(), calculateFinalPrice() |

---

**OrderItem**

Stores the specific meal chosen for each working day within a subscription. Always 5 rows per subscription.

| | |
|---|---|
| **Attributes** | order_item_id, subscription_id, meal_id, day_date, day_of_week, status, created_at |
| **Methods** | createOrderItems(), getOrderItemsBySubscription(), cancelOrderItems() |

---

**DiscountCode**

Stores promotional codes that clients can apply at checkout.

| | |
|---|---|
| **Attributes** | discount_code_id, code, discount_percentage, is_active, expires_at, created_at |
| **Methods** | validateCode(), getActiveCode() |

---

**Payment**

Records the payment transaction for each subscription. One payment per subscription.

| | |
|---|---|
| **Attributes** | payment_id, subscription_id, amount, payment_status, transaction_id, gateway_response, created_at |
| **Methods** | createPayment(), updatePaymentStatus(), getPaymentBySubscription() |

---

**Review**

Stores a client's rating and optional comment for a specific meal they received.

| | |
|---|---|
| **Attributes** | review_id, order_item_id, user_id, rating, comment, created_at |
| **Methods** | submitReview(), getReviewsByMeal(), validateReviewOwnership() |

---

### 2.2 Frontend Components

The frontend is built with React.js. The main components are organized by user type.

**Shared Components**

| Component | Description |
|---|---|
| Navbar | Top navigation bar. Shows different links based on user type (client, restaurant, admin). |
| MealCard | Displays a single meal with photo, name, ingredients, calories, and macronutrients. Used on the meal browsing and weekly selection pages. |
| LoadingSpinner | Displayed while API calls are in progress. |
| ProtectedRoute | Wraps routes that require authentication. Redirects to login if no valid JWT token is found. |

**Customer Components**

| Component | Description |
|---|---|
| RegisterPage | Form for new client registration. Collects personal info and health profile fields. Sends POST /api/auth/register. |
| LoginPage | Email and password login form. Sends POST /api/auth/login and stores the JWT token. |
| RestaurantListPage | Displays all verified restaurants. Fetches from GET /api/restaurants. |
| MealBrowsePage | Displays all available meals for a selected restaurant. Fetches from GET /api/meals/:restaurantId. |
| WeeklyPlanSelector | Shows a 5-day plan (Sunday–Thursday). Client selects one meal per day. Tracks selections in component state. |
| OrderSummaryPage | Displays the full weekly selection for review before submission. Shows total price and discount if applied. |
| CheckoutPage | Collects delivery time and address. Accepts optional discount code input. Sends POST /api/subscriptions. |
| PaymentPage | Collects payment method and submits. Sends POST /api/payments. |
| CustomerDashboard | Shows the client's active and past subscriptions. Fetches from GET /api/subscriptions/:userId. |

**Restaurant Components**

| Component | Description |
|---|---|
| RestaurantLoginPage | Login form specific to restaurant accounts. |
| RestaurantRegisterPage | Registration form for new restaurant accounts. |
| MealDashboard | Lists all meals belonging to the restaurant. Supports add, edit, and delete actions. |
| AddMealForm | Form for creating a new meal with image upload, nutritional data, and tag selection. Sends POST /api/meals. |
| EditMealForm | Pre-filled form for updating an existing meal. Sends PUT /api/meals/:mealId. |
| OrdersByDayView | Displays incoming customer meal selections grouped by day for advance preparation. |

**Admin Components**

| Component | Description |
|---|---|
| AdminLoginPage | Login form for the admin account. |
| PendingRestaurantsPage | Lists all restaurants awaiting verification. Admin can approve or reject each one. Sends PATCH /api/admin/restaurants/:restaurantId/status. |
| AdminDashboard | Overview of platform data: total users, restaurants, and subscriptions. |

---


### 2.3 Table Definitions

#### app_user

Stores all platform users across three types. Health profile and address columns apply to clients only and are NULL for restaurant and admin accounts.

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| user_id | SERIAL | PK | Unique identifier |
| user_type | user_type_enum | NOT NULL | 'client', 'restaurant', 'admin' |
| full_name | VARCHAR(100) | NOT NULL | |
| email | VARCHAR(150) | UNIQUE, NOT NULL | Used for login |
| password_hash | VARCHAR(255) | NOT NULL | Never store plain text |
| phone | VARCHAR(15) | NULL | |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| is_active | BOOLEAN | DEFAULT TRUE | Admin can deactivate accounts |
| age | INT | NULL | Client only |
| gender | gender_enum | NULL | 'male', 'female' — client only |
| height_cm | DECIMAL(5,2) | NULL | Client only |
| weight_kg | DECIMAL(5,2) | NULL | Client only |
| health_goal | health_goal_enum | NULL | 'lose_weight', 'maintain', 'bulking', 'gaining_weight' |
| home_address | VARCHAR(255) | NULL | Client only |
| work_address | VARCHAR(255) | NULL | Client only |

#### restaurant

Represents a restaurant business entity. Linked one-to-one with an `app_user` account. Admin verifies restaurants before they appear in listings.

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| restaurant_id | SERIAL | PK | Unique identifier |
| user_id | INT | FK → app_user, UNIQUE, NOT NULL | One-to-one with app_user |
| restaurant_name | VARCHAR(150) | NOT NULL | |
| description | TEXT | NULL | Short restaurant bio |
| logo_url | VARCHAR(255) | NULL | Path to uploaded logo |
| is_verified | BOOLEAN | DEFAULT FALSE | Admin sets to TRUE after review |
| rejection_reason | VARCHAR(255) | NULL | Filled only when admin rejects |
| created_at | TIMESTAMP | DEFAULT NOW() | |


#### meal

Stores all meals offered by restaurants. Includes full nutritional data and dietary tags. Uses a soft delete pattern to preserve order history.

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| meal_id | SERIAL | PK | Unique identifier |
| restaurant_id | INT | FK → restaurant, NOT NULL | Which restaurant owns this meal |
| name | VARCHAR(150) | NOT NULL | |
| description | TEXT | NULL | |
| ingredients | TEXT | NOT NULL | Full ingredients list |
| calories | INT | NOT NULL | Total calories per serving |
| protein_g | DECIMAL(5,2) | NOT NULL | Grams of protein |
| carbs_g | DECIMAL(5,2) | NOT NULL | Grams of carbohydrates |
| fats_g | DECIMAL(5,2) | NOT NULL | Grams of fats |
| image_url | VARCHAR(255) | NULL | Path to meal photo |
| tags | TEXT[] | NULL | Vegan, PlantBased, Vegetarian, Keto, GlutenFree, DairyFree |
| is_available | BOOLEAN | DEFAULT TRUE | FALSE hides meal without deleting (soft delete) |
| created_at | TIMESTAMP | DEFAULT NOW() | |


#### subscription
Records a client's weekly lunch subscription. Stores pricing as a receipt without real payment processing. Auto-confirms on submission.

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| subscription_id | SERIAL | PK | Unique identifier |
| user_id | INT | FK → app_user, NOT NULL | The client who subscribed |
| discount_code_id | INT | FK → discount_code, NULL | NULL if no code applied |
| start_date | DATE | NOT NULL | Client picks this |
| end_date | DATE | NOT NULL | Always start_date + 6 days, backend calculates |
| delivery_time | TIME | NOT NULL | Preferred delivery time at checkout |
| delivery_address | delivery_address_enum | NOT NULL | 'home' or 'work' — references columns in app_user |
| original_price | DECIMAL(7,2) | NOT NULL | Flat weekly subscription fee |
| discount_amount | DECIMAL(7,2) | DEFAULT 0.00 | Amount deducted by discount code |
| final_price | DECIMAL(7,2) | NOT NULL | Must equal original_price - discount_amount (CHECK enforced) |
| status | subscription_status_enum | DEFAULT 'confirmed' | 'confirmed' or 'cancelled' |
| is_renewed | BOOLEAN | DEFAULT FALSE | TRUE if created from a previous subscription renewal |
| created_at | TIMESTAMP | DEFAULT NOW() | |


#### order_item
Stores the specific meal selected for each working day in a subscription. Always exactly 5 rows per subscription (Sunday to Thursday). Locked once confirmed — no edits allowed after submission.

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| order_item_id | SERIAL | PK | Unique identifier |
| subscription_id | INT | FK → subscription, NOT NULL | Which subscription this belongs to |
| meal_id | INT | FK → meal, NOT NULL | Which meal was chosen |
| day_date | DATE | NOT NULL | The actual date of this meal |
| day_of_week | day_of_week_enum | NOT NULL | 'Sunday' through 'Thursday' |
| status | order_item_status_enum | DEFAULT 'confirmed' | 'confirmed' or 'cancelled' |
| created_at | TIMESTAMP | DEFAULT NOW() | |


#### discount_code
| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| discount_code_id | SERIAL | PK | Unique identifier |
| code | VARCHAR(50) | UNIQUE, NOT NULL | e.g. 'WORK20' |
| discount_percentage | DECIMAL(5,2) | NOT NULL, CHECK > 0 AND <= 100 | e.g. 20.00 means 20% off |
| is_active | BOOLEAN | DEFAULT TRUE | Admin can deactivate without deleting |
| expires_at | TIMESTAMP | NULL | NULL means no expiry |
| created_at | TIMESTAMP | DEFAULT NOW() | |


#### payment
Records the payment transaction linked to a subscription. One payment row per subscription. Stores the gateway response for audit purposes without processing real money in the MVP.

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| payment_id | SERIAL | PK | Unique identifier |
| subscription_id | INT | FK → subscription, UNIQUE, NOT NULL | One payment per subscription |
| amount | DECIMAL(7,2) | NOT NULL | Must match subscription.final_price |
| payment_status | payment_status_enum | NOT NULL | 'success', 'failed', 'pending' |
| transaction_id | VARCHAR(100) | NULL | Reference ID returned by the gateway |
| gateway_response | TEXT | NULL | Raw response from Payment Gateway API for debugging |
| created_at | TIMESTAMP | DEFAULT NOW() | |


#### review
Stores a client's rating and optional comment for a specific meal they received. One review per order_item — enforced by the UNIQUE constraint on `order_item_id`. A review can only be submitted after the subscription is confirmed.

| Column | Data Type | Constraints | Notes |
|---|---|---|---|
| review_id | SERIAL | PK | Unique identifier |
| order_item_id | INT | FK → order_item, UNIQUE, NOT NULL | One review per meal per day |
| user_id | INT | FK → app_user, NOT NULL | The client who wrote the review |
| rating | INT | NOT NULL, CHECK >= 1 AND <= 5 | Star rating from 1 to 5 |
| comment | TEXT | NULL | Optional written feedback |
| created_at | TIMESTAMP | DEFAULT NOW() | |


### 2.4 Relationships

![Entity Relationship Diagram](<./assets/Entity_Relationship_Diagram.png>)

| Relationship | Type | From | To | On Delete |
|---|---|---|---|---|
| app_user → restaurant | One-to-One | app_user.user_id | restaurant.user_id | RESTRICT |
| restaurant → meal | One-to-Many | restaurant.restaurant_id | meal.restaurant_id | RESTRICT |
| app_user → subscription | One-to-Many | app_user.user_id | subscription.user_id | RESTRICT |
| discount_code → subscription | One-to-Many | discount_code.discount_code_id | subscription.discount_code_id | SET NULL |
| subscription → order_item | One-to-Many | subscription.subscription_id | order_item.subscription_id | RESTRICT |
| meal → order_item | One-to-Many | meal.meal_id | order_item.meal_id | RESTRICT |
| subscription → payment | One-to-One | subscription.subscription_id | payment.subscription_id | RESTRICT |
| order_item → review | One-to-One | order_item.order_item_id | review.order_item_id | RESTRICT |
| app_user → review | One-to-Many | app_user.user_id | review.user_id | RESTRICT |

### 2.5 Key Design Decisions

| Decision | Choice Made | Reason |
|---|---|---|
| Health profile storage | Columns in app_user table | Simpler for MVP — avoids extra JOIN for client profile data |
| Address storage | Home + work columns in app_user table | MVP limits to 2 addresses — separate table not justified |
| Meal tags | TEXT[] array with 6 allowed values | Fixed tag list stored as array — validation enforced at API level |
| Meal pricing | No price column on meal | Flat fee subscription model — price lives on subscription, not meal |
| Subscription pricing | original + discount + final columns | Acts as a receipt without real payment processing |
| Meal selection locking | Locked on confirmation, no updates | Restaurants need reliable order data for advance preparation |
| Soft delete | is_available = FALSE on meal | Preserves order history for restaurants and evaluators |
| Discount codes | Global, no usage limit per MVP | Admin controls availability via is_active flag |
| Subscription status | Auto-confirmed on submission | No manual confirmation step in the MVP flow |
| ENUM types | Defined as CREATE TYPE before tables | PostgreSQL requires named types before column use |
| Payment storage | Separate payment table, one row per subscription | Keeps subscription table clean and allows storing gateway response for audit |
| Payment status default | Starts as 'pending', updated after gateway response | Prevents confirming a subscription before payment is verified |
| Review scope | One review per order_item | Ties feedback to a verified purchase — clients can only review meals they actually received |
| Review ownership check | Enforced at API level | Ensures clients cannot review another client's order_item |

---

## 3. High-Level Sequence Diagrams

The sequence diagrams below illustrate the key interactions between system components: Customer/Restaurant/Admin, Frontend Web App (React), Backend API (Python/FastAPI), Image Storage, and Database (PostgreSQL). Solid lines represent requests; dashed lines represent responses.

### 3.1 Customer Registration and Login

This sequence shows how a customer creates an account and logs in to the platform. During registration, the customer submits all required fields: name, email, password, age, height, weight, gender, health goal, and address. The backend validates the fields, hashes the password, and inserts a new user record with `role = customer`. After registration, the customer logs in using email and password. The backend finds the user by email, compares the password against the stored hash, and returns a JWT token along with the user role. The customer is then redirected to the customer dashboard.

![Diagram 3.1 — Customer Registration and Login](<./assets/Customer Registration and Login2.png>)

### 3.2 Restaurant Owner Adds a Meal


This sequence shows how a restaurant owner adds a new meal to the platform. The owner opens the add meal page, enters meal details, and uploads an image. The backend first checks that the user role is `restaurant_owner`, then queries the database to verify the restaurant belongs to this owner. The meal image is sent to Image Storage, which returns a URL. The backend then validates the meal details and inserts the new meal record into the database. A success response is returned and the dashboard confirms the meal was added.

![Diagram 3.2 — Restaurant Owner Adds a Meal](<./assets/Restaurant Owner Adds a Meal.png>)

### 3.3 Restaurant Owner Updates or Deletes a Meal

This sequence shows how a restaurant owner manages existing meals. The owner opens the meal management page and the dashboard fetches the current meal list via `GET /api/restaurants/{restaurant_id}/meals`. Two alternative flows are shown. For an update, the owner edits meal details and the backend receives a `PUT /api/meals/{meal_id}` request, checks ownership and validates the data, updates the meal record, and returns the updated meal. For a deletion, the owner clicks delete and the backend receives a `DELETE /api/meals/{meal_id}` request, checks ownership, and performs a soft delete by setting `is_available = false` rather than removing the row, preserving order history.

![Diagram 3.3 — Restaurant Owner Updates or Deletes a Meal](<./assets/Restaurant Owner Updates or Deletes a Meal.png>)

### 3.4 Admin Approves or Rejects a Restaurant

This sequence shows how the admin reviews restaurant registrations. The admin opens the dashboard, which calls `GET /api/admin/restaurants?status=pending`. The backend verifies the user role is `admin`, fetches the pending restaurant list from the database, and returns it to the dashboard. The admin then selects a decision, triggering `PATCH /api/admin/restaurants/{restaurant_id}/status`. The backend validates admin permission and updates the restaurant status in the database. Only approved restaurants appear to customers on the meal selection page.

![Diagram 3.4 — Admin Approves or Rejects a Restaurant](<./assets/Admin Approves a Restaurant.png>)

---

## 4. External and Internal APIs

### 4.1 External APIs

| External API | Purpose | Reason for Selection |
|---|---|---|
| Payment Gateway API (e.g., Stripe) | Secure online payment processing for subscriptions | Enables users to complete subscription payments safely and efficiently |

#### Payment Gateway Integration

The platform uses a Payment Gateway API to allow users to pay for their meal subscriptions securely online. The payment process works as follows:

1. The user selects a subscription plan and confirms their meal choices.
2. The frontend sends payment details to the backend.
3. The backend communicates with the Payment Gateway API.
4. The payment is processed securely.
5. A success or failure response is returned to the system.
6. The subscription is confirmed upon successful payment.

### 4.2 Internal API Endpoints

The system follows RESTful API principles and uses JSON for data exchange.

| # | Endpoint | Method | Description |
|---|---|---|---|
| 1 | `/api/auth/register` | POST | Register a new user (client or restaurant) |
| 2 | `/api/auth/login` | POST | Authenticate user and return JWT token |
| 3 | `/api/restaurants` | GET | Get all verified restaurants |
| 4 | `/api/meals/:restaurantId` | GET | Get all available meals for a restaurant |
| 5 | `/api/meals` | POST | Add a new meal (restaurant only) |
| 6 | `/api/meals/:mealId` | PUT | Update an existing meal (restaurant only) |
| 7 | `/api/meals/:mealId` | DELETE | Soft delete a meal — sets is_available = FALSE |
| 8 | `/api/users/:userId` | PATCH | Update client delivery address |
| 9 | `/api/discount-codes/validate` | POST | Validate a discount code at checkout |
| 10 | `/api/subscriptions` | POST | Create a weekly subscription with 5 meal selections |
| 11 | `/api/payments` | POST | Process subscription payment via Payment Gateway |
| 12 | `/api/subscriptions/:userId` | GET | Get all subscriptions for a user |
| 13 | `/api/admin/restaurants` | GET | Admin: get all restaurants including unverified |
| 14 | `/api/admin/restaurants/:restaurantId/status` | PATCH | Admin: approve or reject a restaurant |
| 15 | `/api/admin/subscriptions` | GET | Admin: get all subscriptions on the platform |
| 16 | `/api/reviews` | POST | Submit a review for a specific order_item (client only) |
| 17 | `/api/reviews/meal/:mealId` | GET | Get all reviews for a specific meal |

The following examples detail the input and output for the most complex endpoints:

#### POST /api/auth/register

**Input:**
```json
{
  "full_name": "Reem Alshehri",
  "email": "reem@example.com",
  "password": "123456",
  "user_type": "client",
  "phone": "0501234567",
  "age": 28,
  "gender": "female",
  "height_cm": 165.00,
  "weight_kg": 60.00,
  "health_goal": "maintain",
  "home_address": "Riyadh, Al Olaya",
  "work_address": "Riyadh, King Fahd Road"
}
```

> Health profile fields are required for `user_type = "client"` and must be omitted for `user_type = "restaurant"`.

**Output:**
```json
{ "message": "User registered successfully" }
```

#### POST /api/subscriptions

**Input:**
```json
{
  "start_date": "2026-06-22",
  "delivery_time": "12:30",
  "delivery_address": "work",
  "discount_code_id": 3,
  "selected_meals": [
    { "day_date": "2026-06-22", "day_of_week": "Sunday",    "meal_id": 1 },
    { "day_date": "2026-06-23", "day_of_week": "Monday",    "meal_id": 4 },
    { "day_date": "2026-06-24", "day_of_week": "Tuesday",   "meal_id": 7 },
    { "day_date": "2026-06-25", "day_of_week": "Wednesday", "meal_id": 2 },
    { "day_date": "2026-06-26", "day_of_week": "Thursday",  "meal_id": 9 }
  ]
}
```

**Output:**
```json
{ "subscription_id": 12, "status": "confirmed", "final_price": 180.00 }
```

#### POST /api/payments

**Input:**
```json
{
  "subscription_id": 12,
  "amount": 180.00
}
```

**Output:**
```json
{ "payment_status": "success", "transaction_id": "TXN123456" }
```

#### POST /api/reviews

**Input:**
```json
{
  "order_item_id": 3,
  "rating": 4,
  "comment": "Great meal, well seasoned."
}
```

**Output:**
```json
{ "message": "Review submitted successfully" }
```

#### GET /api/reviews/meal/:mealId

**Input:**

Path parameter: `mealId`

**Output:**
```json
[
  {
    "review_id": 1,
    "rating": 4,
    "comment": "Great meal, well seasoned.",
    "created_at": "2026-06-22T13:00:00Z"
  }
]
```

#### PATCH /api/admin/restaurants/:restaurantId/status

**Input — Approve:**
```json
{ "is_verified": true }
```

**Input — Reject:**
```json
{ "is_verified": false, "rejection_reason": "Missing health certificate" }
```

**Output:**
```json
{ "message": "Restaurant status updated successfully" }
```

### 4.3 API Design Justification

The project uses RESTful APIs because they are simple, scalable, and widely adopted in modern web applications. JSON was selected as the data exchange format because it is lightweight, human-readable, and fully supported by React.js and Python/FastAPI applications. The Payment Gateway API was selected to provide secure online transactions and improve the subscription experience for users while maintaining scalability for future growth.

---

## 5. SCM and QA Strategies

### 5.1 SCM Strategy

**Tool:** Git and GitHub

#### Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable production-ready code only |
| `development` | Integration branch — all features merge here first |
| `feature/[name]` | One branch per feature (e.g. feature/login, feature/meal-selection) |
| `fix/[name]` | For bug fixes (e.g. fix/login-error) |

#### Workflow

1. Each team member creates a feature branch from `development`
2. Work is committed with clear messages (e.g. `Add restaurant listing API`)
3. When feature is done, open a Pull Request to `development`
4. At least one team member reviews the code before merging
5. After testing, `development` is merged into `main` for final release

#### Commit Guidelines

- Write clear and descriptive commit messages
- Commit small and often — one logical change per commit
- Example: `Add meal selection page UI` not `update stuff`

### 5.2 QA Strategy

#### Testing Strategy

| Test Type | Description | Tool |
|---|---|---|
| Unit Testing | Test individual functions and API endpoints in isolation | pytest |
| Integration Testing | Test how frontend and backend communicate | Postman |
| User Flow Testing | Test complete user journeys end-to-end | Manual testing |
| Regression Testing | Re-test after bug fixes to ensure nothing broke | Manual testing |

#### Testing Plan

| User Flow | Steps to Test |
|---|---|
| Registration | Open register page → fill form → submit → verify account created |
| Login | Enter email and password → submit → verify redirect to dashboard |
| Browse restaurants | Click Restaurants → verify list loads correctly |
| Select meals | Choose restaurant → select meal for each day → verify saved |
| Submit order | Review summary → click Confirm → verify order saved in database |
| Admin view | Login as admin → open dashboard → verify users and orders visible |

#### Bug Tracking

- All bugs documented in GitHub Issues
- Each issue includes: description, steps to reproduce, expected vs actual result
- Bugs labeled by severity: **Critical / Major / Minor**

#### Deployment Pipeline

| Environment | Purpose |
|---|---|
| Local | Development and testing on each team member's machine |
| Staging | Final testing before release (using Render or Railway) |
| Production | Live version for demo and final submission |
