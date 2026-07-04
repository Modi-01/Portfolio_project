-- ============================================================
-- Healthy Meals Subscription Platform — PostgreSQL Schema
-- Stage 3: Technical Documentation
-- Lead Database: Badryah Almalki
-- ============================================================

-- ============================================================
-- ENUM TYPES
-- Must be created before the tables that use them
-- ============================================================
CREATE TYPE user_type_enum AS ENUM (
    'client',
    'restaurant',
    'admin'
);

CREATE TYPE gender_enum AS ENUM (
    'male',
    'female'
);

CREATE TYPE health_goal_enum AS ENUM (
    'lose_weight',
    'maintain',
    'bulking',
    'gaining_weight'
);

CREATE TYPE subscription_status_enum AS ENUM (
    'confirmed',
    'cancelled'
);

CREATE TYPE day_of_week_enum AS ENUM (
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday'
);

CREATE TYPE order_item_status_enum AS ENUM (
    'confirmed',
    'cancelled'
);

CREATE TYPE payment_status_enum AS ENUM (
    'pending',
    'success',
    'failed'
);

-- ============================================================
-- TABLE 1: discount_code
-- No foreign key dependencies — created first
-- ============================================================
CREATE TABLE discount_code (
    discount_code_id    SERIAL          NOT NULL,
    code                VARCHAR(50)     NOT NULL,
    discount_percentage DECIMAL(5,2)    NOT NULL,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    expires_at          TIMESTAMP                DEFAULT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_discount_code PRIMARY KEY (discount_code_id),
    CONSTRAINT uq_discount_code_code UNIQUE (code),
    CONSTRAINT chk_discount_percentage
        CHECK (discount_percentage > 0 AND discount_percentage <= 100)
);

-- ============================================================
-- TABLE 2: app_user
-- Renamed from 'user' — reserved word in PostgreSQL
-- No foreign key dependencies — created second
-- Health profile and address columns are NULL for
-- restaurant and admin user types (enforced by backend)
-- ⚠️  NOTE FOR MOUDHI (BACKEND) — TEAM DECISION:
-- Admin registers through the SAME public registration page
-- as client/restaurant (user_type = 'admin'), not seeded
-- manually. This is a known security tradeoff for the MVP —
-- anyone could currently select 'admin' at signup. If time
-- allows, consider one lightweight safeguard (e.g. a fixed
-- admin invite code required in the payload when
-- user_type = 'admin', or restricting it to the first admin
-- account only). Flagging this so it's a conscious choice,
-- not an oversight, for the project write-up.
-- ============================================================
CREATE TABLE app_user (
    user_id         SERIAL                  NOT NULL,
    user_type       user_type_enum          NOT NULL,
    full_name       VARCHAR(100)            NOT NULL,
    email           VARCHAR(150)            NOT NULL,
    password_hash   VARCHAR(255)            NOT NULL,
    phone           VARCHAR(15)             DEFAULT NULL,
    created_at      TIMESTAMP               NOT NULL DEFAULT NOW(),
    is_active       BOOLEAN                 NOT NULL DEFAULT TRUE,

    -- Health profile (client only — NULL for restaurant and admin)
    age             INT                     DEFAULT NULL,
    gender          gender_enum             DEFAULT NULL,
    height_cm       DECIMAL(5,2)            DEFAULT NULL,
    weight_kg       DECIMAL(5,2)            DEFAULT NULL,
    health_goal     health_goal_enum        DEFAULT NULL,

    -- Address (client only — NULL for restaurant and admin)
    -- Single fixed address per user (updated per team decision:
    -- one address only, no home/work distinction)
    address         VARCHAR(255)            DEFAULT NULL,

    CONSTRAINT pk_app_user PRIMARY KEY (user_id),
    CONSTRAINT uq_app_user_email UNIQUE (email),
    -- Security safeguard for team decision to allow admin
    -- registration via the public register page: only emails
    -- on the team-controlled domain can be user_type = 'admin'.
    -- Replace 'yourcompany-admin.com' with the actual domain
    -- the team creates and controls.
    CONSTRAINT chk_admin_email_domain
        CHECK (
            user_type <> 'admin'
            OR LOWER(email) LIKE '%@qooti-admin.com'
        )
);

-- ============================================================
-- TABLE 3: restaurant
-- Depends on: app_user
-- ⚠️  NOTE FOR MOUDHI (BACKEND):
-- When is_verified = TRUE, rejection_reason should be NULL.
-- When is_verified = FALSE after admin review,
-- rejection_reason should contain the reason.
-- This logic must be enforced at the backend/API level.
-- ============================================================
CREATE TABLE restaurant (
    restaurant_id       SERIAL          NOT NULL,
    user_id             INT             NOT NULL,
    restaurant_name     VARCHAR(150)    NOT NULL,
    description         TEXT            DEFAULT NULL,
    logo_url            VARCHAR(255)    DEFAULT NULL,
    is_verified         BOOLEAN         NOT NULL DEFAULT FALSE,
    rejection_reason    VARCHAR(255)    DEFAULT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_restaurant PRIMARY KEY (restaurant_id),
    CONSTRAINT uq_restaurant_user UNIQUE (user_id),
    CONSTRAINT fk_restaurant_user
        FOREIGN KEY (user_id)
        REFERENCES app_user (user_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 4: meal
-- Depends on: restaurant
-- Soft delete pattern: use is_available = FALSE instead of
-- deleting meals that are referenced in order_item history
-- ⚠️  NOTE FOR MOUDHI (BACKEND):
-- tags is a TEXT[] array. PostgreSQL does not enforce allowed
-- values natively — validate that submitted tags contain only
-- allowed values at the API level.
-- To filter by tag: SELECT * FROM meal WHERE 'Vegan' = ANY(tags);
-- ============================================================
CREATE TABLE meal (
    meal_id         SERIAL          NOT NULL,
    restaurant_id   INT             NOT NULL,
    name            VARCHAR(150)    NOT NULL,
    description     TEXT            DEFAULT NULL,
    ingredients     TEXT            NOT NULL,
    calories        INT             NOT NULL,
    protein_g       DECIMAL(5,2)    NOT NULL,
    carbs_g         DECIMAL(5,2)    NOT NULL,
    fats_g          DECIMAL(5,2)    NOT NULL,
    image_url       VARCHAR(255)    DEFAULT NULL,
    tags            TEXT[]          DEFAULT NULL,
    is_available    BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_meal PRIMARY KEY (meal_id),
    CONSTRAINT fk_meal_restaurant
        FOREIGN KEY (restaurant_id)
        REFERENCES restaurant (restaurant_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 5: subscription
-- Depends on: app_user, discount_code
-- end_date is always start_date + 6 days — backend calculates,
-- database stores for simpler queries
-- ⚠️  NOTE FOR MOUDHI (BACKEND):
-- Only users with user_type = 'client' should be allowed to
-- create a subscription. Restaurant and admin users must be
-- rejected at the API level before any INSERT is attempted.
-- Each order_item's day_date must fall within the subscription's
-- start_date and end_date range. Validate this in the backend
-- before inserting order_item rows.
-- Delivery address is no longer chosen per subscription — the
-- client's single fixed address (app_user.address) is used
-- automatically at delivery time.
-- ============================================================
CREATE TABLE subscription (
    subscription_id     SERIAL                      NOT NULL,
    user_id             INT                         NOT NULL,
    discount_code_id    INT                         DEFAULT NULL,
    start_date          DATE                        NOT NULL,
    end_date            DATE                        NOT NULL,
    delivery_time       TIME                        NOT NULL,
    original_price      DECIMAL(7,2)                NOT NULL,
    discount_amount     DECIMAL(7,2)                NOT NULL DEFAULT 0.00,
    final_price         DECIMAL(7,2)                NOT NULL,
    status              subscription_status_enum    NOT NULL DEFAULT 'confirmed',
    is_renewed          BOOLEAN                     NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP                   NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_subscription PRIMARY KEY (subscription_id),
    CONSTRAINT chk_final_price
        CHECK (final_price = original_price - discount_amount),
    CONSTRAINT fk_subscription_user
        FOREIGN KEY (user_id)
        REFERENCES app_user (user_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_subscription_discount
        FOREIGN KEY (discount_code_id)
        REFERENCES discount_code (discount_code_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 6: order_item
-- Depends on: subscription, meal
-- ⚠️  NOTE FOR MOUDHI (BACKEND):
-- Once an order_item row is inserted, NO UPDATE or DELETE
-- should be allowed through the API — meal selection is
-- locked on confirmation.
-- When a subscription is cancelled, backend must update ALL
-- 5 related order_item rows to status = 'cancelled' in the
-- SAME TRANSACTION as the subscription cancellation.
-- ============================================================
CREATE TABLE order_item (
    order_item_id   SERIAL                      NOT NULL,
    subscription_id INT                         NOT NULL,
    meal_id         INT                         NOT NULL,
    day_date        DATE                        NOT NULL,
    day_of_week     day_of_week_enum            NOT NULL,
    status          order_item_status_enum      NOT NULL DEFAULT 'confirmed',
    created_at      TIMESTAMP                   NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_order_item PRIMARY KEY (order_item_id),
    CONSTRAINT uq_order_item_day UNIQUE (subscription_id, day_date),
    CONSTRAINT fk_order_item_subscription
        FOREIGN KEY (subscription_id)
        REFERENCES subscription (subscription_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_order_item_meal
        FOREIGN KEY (meal_id)
        REFERENCES meal (meal_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 7: payment
-- Depends on: subscription
-- One payment row per subscription (enforced by UNIQUE).
-- ⚠️  NOTE FOR MOUDHI (BACKEND):
-- Create the payment row with payment_status = 'pending'
-- immediately after the subscription is inserted.
-- Update to 'success' or 'failed' based on the Payment
-- Gateway API response.
-- Only show the subscription as confirmed to the client
-- once payment_status = 'success'.
-- amount must match subscription.final_price — validate
-- at the API level before inserting.
-- ============================================================
CREATE TABLE payment (
    payment_id          SERIAL                  NOT NULL,
    subscription_id     INT                     NOT NULL,
    amount              DECIMAL(7,2)            NOT NULL,
    payment_status      payment_status_enum     NOT NULL DEFAULT 'pending',
    transaction_id      VARCHAR(100)            DEFAULT NULL,
    gateway_response    TEXT                    DEFAULT NULL,
    created_at          TIMESTAMP               NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_payment PRIMARY KEY (payment_id),
    CONSTRAINT uq_payment_subscription UNIQUE (subscription_id),
    CONSTRAINT fk_payment_subscription
        FOREIGN KEY (subscription_id)
        REFERENCES subscription (subscription_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 8: review
-- Depends on: order_item, app_user
-- One review per order_item (enforced by UNIQUE).
-- ⚠️  NOTE FOR MOUDHI (BACKEND):
-- Verify that the user_id on the review matches the user_id
-- on the subscription that owns the order_item — clients can
-- only review their own meals.
-- Validate that the subscription status = 'confirmed' before
-- allowing a review to be submitted.
-- ============================================================
CREATE TABLE review (
    review_id       SERIAL      NOT NULL,
    order_item_id   INT         NOT NULL,
    user_id         INT         NOT NULL,
    rating          INT         NOT NULL,
    comment         TEXT        DEFAULT NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_review PRIMARY KEY (review_id),
    CONSTRAINT uq_review_order_item UNIQUE (order_item_id),
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT fk_review_order_item
        FOREIGN KEY (order_item_id)
        REFERENCES order_item (order_item_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_review_user
        FOREIGN KEY (user_id)
        REFERENCES app_user (user_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);
