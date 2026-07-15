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

-- 6) restaurant owners + restaurants + meals ("Green Fork Bistro", "Green Bowl", "Fit Kitchen")
INSERT INTO app_user (user_type, full_name, email, password_hash, phone)
VALUES
    ('restaurant', 'Yousef Al-Ghamdi', 'greenfork.owner@example.com', '$2b$10$placeholderhashvalueforrestaurant3000000000000', '+966504567890'),
    ('restaurant', 'Sara Al-Fahad', 'greenbowl.owner@example.com', '$2b$10$placeholderhashvalueforrestaurant1000000000000', '+966502345678'),
    ('restaurant', 'Faisal Al-Mutairi', 'fitkitchen.owner@example.com', '$2b$10$placeholderhashvalueforrestaurant2000000000000', '+966503456789');

INSERT INTO restaurant (user_id, restaurant_name, description, is_verified, logo_url)
VALUES
    (
        (SELECT user_id FROM app_user WHERE email = 'greenfork.owner@example.com'),
        'Green Fork Bistro',
        'Health-focused Mediterranean cuisine made with seasonal, locally-sourced ingredients.',
        TRUE,
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop'
    ),
    (
        (SELECT user_id FROM app_user WHERE email = 'greenbowl.owner@example.com'),
        'Green Bowl',
        'Fresh, plant-forward healthy lunch bowls.',
        TRUE,
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop'
    ),
    (
        (SELECT user_id FROM app_user WHERE email = 'fitkitchen.owner@example.com'),
        'Fit Kitchen',
        'High-protein, macro-balanced meals for active lifestyles.',
        TRUE,
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop'
    );

INSERT INTO meal (restaurant_id, name, description, ingredients, calories, protein_g, carbs_g, fats_g, tags, image_url)
VALUES
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Green Fork Bistro'),
        'Zesty Salmon & Asparagus',
        'Pan-seared salmon with grilled asparagus and lemon herb sauce.',
        'Salmon, asparagus, lemon, olive oil, garlic, herbs',
        480, 38.5, 12.0, 28.0, ARRAY['HighProtein', 'GlutenFree'],
        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80'
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Green Fork Bistro'),
        'Truffle Forest Grains',
        'Ancient grain bowl with wild mushrooms and truffle oil.',
        'Quinoa, farro, wild mushrooms, truffle oil, parmesan, arugula',
        420, 16.0, 52.0, 14.0, ARRAY['LowCarb'],
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80'
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Green Fork Bistro'),
        'Mediterranean Chicken Bowl',
        'Grilled chicken breast with hummus, tabbouleh, and pickled vegetables.',
        'Chicken breast, hummus, bulgur, parsley, tomato, cucumber',
        510, 42.0, 38.0, 18.0, ARRAY['HighProtein'],
        'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=800&q=80'
    );

INSERT INTO meal (restaurant_id, name, ingredients, calories, protein_g, carbs_g, fats_g, tags, image_url)
VALUES
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Green Bowl'),
        'Grilled Chicken Quinoa Bowl',
        'Grilled chicken breast, quinoa, roasted vegetables, tahini dressing',
        450, 38.00, 42.00, 14.00, ARRAY['GlutenFree'],
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Green Bowl'),
        'Falafel Power Bowl',
        'Baked falafel, hummus, cucumber, tomato, pickled onions, tahini',
        420, 16.00, 55.00, 15.00, ARRAY['Vegan', 'PlantBased'],
        'https://images.unsplash.com/photo-1547496502-affa22d38842?w=800&h=600&fit=crop'
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Green Bowl'),
        'Salmon Avocado Salad',
        'Grilled salmon, avocado, mixed greens, cherry tomatoes, lemon vinaigrette',
        480, 34.00, 18.00, 28.00, ARRAY['GlutenFree', 'DairyFree'],
        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop'
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Green Bowl'),
        'Vegetable Stir Fry with Tofu',
        'Tofu, broccoli, carrots, bell peppers, brown rice, soy-ginger sauce',
        390, 20.00, 48.00, 12.00, ARRAY['Vegan', 'PlantBased', 'DairyFree'],
        'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=600&fit=crop'
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Green Bowl'),
        'Turkey Lettuce Wrap Plate',
        'Ground turkey, lettuce cups, shredded carrots, sweet chili sauce',
        360, 30.00, 20.00, 16.00, ARRAY['GlutenFree', 'DairyFree'],
        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop'
    );

INSERT INTO meal (restaurant_id, name, ingredients, calories, protein_g, carbs_g, fats_g, tags, image_url)
VALUES
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Fit Kitchen'),
        'Steak and Sweet Potato Plate',
        'Grilled sirloin steak, roasted sweet potato, steamed green beans',
        520, 42.00, 38.00, 20.00, ARRAY['GlutenFree', 'DairyFree'],
        'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop'
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Fit Kitchen'),
        'High-Protein Chicken Pasta',
        'Grilled chicken, whole wheat pasta, spinach, light cream sauce',
        510, 40.00, 50.00, 12.00, ARRAY[]::TEXT[],
        'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop'
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Fit Kitchen'),
        'Egg White Veggie Scramble',
        'Egg whites, spinach, mushrooms, bell peppers, side of oats',
        340, 30.00, 30.00, 8.00, ARRAY['Vegetarian', 'GlutenFree'],
        'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=600&fit=crop'
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Fit Kitchen'),
        'Lean Beef Rice Bowl',
        'Lean ground beef, jasmine rice, sauteed zucchini, garlic sauce',
        480, 36.00, 45.00, 14.00, ARRAY['DairyFree'],
        'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=800&h=600&fit=crop'
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Fit Kitchen'),
        'Protein Shrimp Bowl',
        'Grilled shrimp, brown rice, edamame, avocado, sriracha mayo',
        440, 32.00, 40.00, 15.00, ARRAY['DairyFree'],
        'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=600&fit=crop'
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
