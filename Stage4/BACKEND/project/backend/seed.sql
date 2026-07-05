-- ============================================================
-- Qooti — Mock Seed Data
-- Sprint 1, Task 5: 2 restaurants, 5 meals each, 1 admin user
-- Run AFTER schema0.1.sql has been executed successfully
-- ============================================================

-- ============================================================
-- 1 ADMIN USER
-- Email must match the admin domain constraint (chk_admin_email_domain)
-- ============================================================
INSERT INTO app_user (user_type, full_name, email, password_hash, phone)
VALUES (
    'admin',
    'Qooti Admin',
    'admin@qooti_admin.com',
    '$2b$10$placeholderhashvalueforadminuser000000000000000000',
    '+966501234567'
);

-- ============================================================
-- 2 RESTAURANT OWNER ACCOUNTS (app_user)
-- ============================================================
INSERT INTO app_user (user_type, full_name, email, password_hash, phone)
VALUES
    ('restaurant', 'Sara Al-Fahad', 'greenbowl.owner@example.com', '$2b$10$placeholderhashvalueforrestaurant1000000000000', '+966502345678'),
    ('restaurant', 'Faisal Al-Mutairi', 'fitkitchen.owner@example.com', '$2b$10$placeholderhashvalueforrestaurant2000000000000', '+966503456789');

-- ============================================================
-- 2 RESTAURANTS (linked to the two accounts above)
-- Using subqueries to fetch the correct user_id by email
-- Both marked is_verified = TRUE so they show up in listings
-- ============================================================
INSERT INTO restaurant (user_id, restaurant_name, description, is_verified)
VALUES
    (
        (SELECT user_id FROM app_user WHERE email = 'greenbowl.owner@example.com'),
        'Green Bowl',
        'Fresh, plant-forward healthy lunch bowls.',
        TRUE
    ),
    (
        (SELECT user_id FROM app_user WHERE email = 'fitkitchen.owner@example.com'),
        'Fit Kitchen',
        'High-protein, macro-balanced meals for active lifestyles.',
        TRUE
    );

-- ============================================================
-- 5 MEALS FOR "Green Bowl"
-- ============================================================
INSERT INTO meal (restaurant_id, name, ingredients, calories, protein_g, carbs_g, fats_g, tags)
VALUES
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Green Bowl'),
        'Grilled Chicken Quinoa Bowl',
        'Grilled chicken breast, quinoa, roasted vegetables, tahini dressing',
        450, 38.00, 42.00, 14.00, ARRAY['GlutenFree']
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Green Bowl'),
        'Falafel Power Bowl',
        'Baked falafel, hummus, cucumber, tomato, pickled onions, tahini',
        420, 16.00, 55.00, 15.00, ARRAY['Vegan', 'PlantBased']
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Green Bowl'),
        'Salmon Avocado Salad',
        'Grilled salmon, avocado, mixed greens, cherry tomatoes, lemon vinaigrette',
        480, 34.00, 18.00, 28.00, ARRAY['GlutenFree', 'DairyFree']
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Green Bowl'),
        'Vegetable Stir Fry with Tofu',
        'Tofu, broccoli, carrots, bell peppers, brown rice, soy-ginger sauce',
        390, 20.00, 48.00, 12.00, ARRAY['Vegan', 'PlantBased', 'DairyFree']
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Green Bowl'),
        'Turkey Lettuce Wrap Plate',
        'Ground turkey, lettuce cups, shredded carrots, sweet chili sauce',
        360, 30.00, 20.00, 16.00, ARRAY['GlutenFree', 'DairyFree']
    );

-- ============================================================
-- 5 MEALS FOR "Fit Kitchen"
-- ============================================================
INSERT INTO meal (restaurant_id, name, ingredients, calories, protein_g, carbs_g, fats_g, tags)
VALUES
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Fit Kitchen'),
        'Steak and Sweet Potato Plate',
        'Grilled sirloin steak, roasted sweet potato, steamed green beans',
        520, 42.00, 38.00, 20.00, ARRAY['GlutenFree', 'DairyFree']
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Fit Kitchen'),
        'High-Protein Chicken Pasta',
        'Grilled chicken, whole wheat pasta, spinach, light cream sauce',
        510, 40.00, 50.00, 12.00, ARRAY[]::TEXT[]
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Fit Kitchen'),
        'Egg White Veggie Scramble',
        'Egg whites, spinach, mushrooms, bell peppers, side of oats',
        340, 30.00, 30.00, 8.00, ARRAY['Vegetarian', 'GlutenFree']
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Fit Kitchen'),
        'Lean Beef Rice Bowl',
        'Lean ground beef, jasmine rice, sauteed zucchini, garlic sauce',
        480, 36.00, 45.00, 14.00, ARRAY['DairyFree']
    ),
    (
        (SELECT restaurant_id FROM restaurant WHERE restaurant_name = 'Fit Kitchen'),
        'Protein Shrimp Bowl',
        'Grilled shrimp, brown rice, edamame, avocado, sriracha mayo',
        440, 32.00, 40.00, 15.00, ARRAY['DairyFree']
    );

-- ============================================================
-- VERIFICATION QUERIES (optional — run after inserting to confirm)
-- ============================================================
-- SELECT user_id, user_type, full_name, email FROM app_user;
-- SELECT restaurant_id, restaurant_name, is_verified FROM restaurant;
-- SELECT meal_id, restaurant_id, name, calories FROM meal ORDER BY restaurant_id;
