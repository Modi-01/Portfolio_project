-- Seed data generated from the uploaded CSV files
-- Target database: healthy_meals_db
-- Execute after schema0.1.sql

BEGIN;

-- app_user data omitted: existing records are preserved

-- 2) restaurant
INSERT INTO restaurant (
    restaurant_id,
    user_id,
    restaurant_name,
    description,
    logo_url,
    is_verified,
    rejection_reason,
    created_at
) VALUES (
    1,
    2,
    'Qooti Restaurant',
    'Restaurant for testing meal APIs',
    NULL,
    TRUE,
    NULL,
    '2026-07-07 22:54:55.727189'
);

-- 3) meal
INSERT INTO meal (
    meal_id,
    restaurant_id,
    name,
    description,
    ingredients,
    calories,
    protein_g,
    carbs_g,
    fats_g,
    image_url,
    tags,
    is_available,
    created_at
) VALUES
(
    2,
    1,
    'Updated Chicken Salad',
    'Healthy grilled chicken salad',
    'Chicken, lettuce, tomato',
    400,
    30.00,
    15.00,
    10.00,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    ARRAY['healthy', 'updated']::TEXT[],
    TRUE,
    '2026-07-07 23:34:34.165107'
),
(
    3,
    1,
    'Updated Grilled Salmon Bowl',
    'Fresh grilled salmon served with brown rice and steamed vegetables.',
    'Salmon, brown rice, broccoli, carrots, olive oil, lemon',
    560,
    38.00,
    34.00,
    22.00,
    'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg',
    ARRAY['healthy', 'seafood', 'updated']::TEXT[],
    TRUE,
    '2026-07-08 18:47:27.779206'
);

-- 4) subscription
INSERT INTO subscription (
    subscription_id,
    user_id,
    discount_code_id,
    start_date,
    end_date,
    delivery_time,
    original_price,
    discount_amount,
    final_price,
    status,
    is_renewed,
    created_at
) VALUES
(
    1, 1, NULL,
    '2026-07-12', '2026-07-16', '13:00:00',
    100.00, 0.00, 100.00,
    'confirmed', FALSE,
    '2026-07-08 20:53:20.033913'
),
(
    2, 1, NULL,
    '2026-07-19', '2026-07-23', '13:00:00',
    100.00, 0.00, 100.00,
    'confirmed', FALSE,
    '2026-07-09 19:25:04.744757'
);

-- 5) order_item
INSERT INTO order_item (
    order_item_id,
    subscription_id,
    meal_id,
    day_date,
    day_of_week,
    status,
    created_at
) VALUES
(
    1, 1, 2,
    '2026-07-12',
    'Sunday',
    'confirmed',
    '2026-07-08 20:54:55.925102'
),
(
    3, 1, 3,
    '2026-07-13',
    'Monday',
    'confirmed',
    '2026-07-08 23:17:46.108537'
);

-- Reset SERIAL sequences because explicit IDs were inserted.
SELECT setval(
    pg_get_serial_sequence('restaurant', 'restaurant_id'),
    (SELECT MAX(restaurant_id) FROM restaurant),
    TRUE
);

SELECT setval(
    pg_get_serial_sequence('meal', 'meal_id'),
    (SELECT MAX(meal_id) FROM meal),
    TRUE
);

SELECT setval(
    pg_get_serial_sequence('subscription', 'subscription_id'),
    (SELECT MAX(subscription_id) FROM subscription),
    TRUE
);

SELECT setval(
    pg_get_serial_sequence('order_item', 'order_item_id'),
    (SELECT MAX(order_item_id) FROM order_item),
    TRUE
);

COMMIT;
