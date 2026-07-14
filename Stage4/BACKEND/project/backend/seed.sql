-- ============================================================
-- Qooti — Mock Seed Data
-- Sprint 1, Task 5: 2 restaurants, 5 meals each, 1 admin user
-- Run AFTER schema0.1.sql has been executed successfully
-- ============================================================

-- ============================================================
-- 1 ADMIN USER (the only admin — provisioned here, never self-registered)
-- Email must match the admin domain constraint (chk_admin_email_domain).
-- DEV login:  admin@qooti_admin.com  /  Admin@Qooti123
-- (Argon2 hash below. CHANGE THIS PASSWORD before any production use.)
-- ============================================================
INSERT INTO app_user (user_type, full_name, email, password_hash, phone)
VALUES (
    'admin',
    'Qooti Admin',
    'admin@qooti_admin.com',
    '$argon2id$v=19$m=65536,t=3,p=4$6n2Pca51TmktxVjLGcMYww$avJScbuB4S7VSCV5bGpYGK2SxN39xborSutvYJ3ileo',
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
INSERT INTO restaurant (user_id, restaurant_name, description, is_verified, logo_url)
VALUES
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

-- ============================================================
-- 5 MEALS FOR "Green Bowl"
-- ============================================================
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

-- ============================================================
-- 5 MEALS FOR "Fit Kitchen"
-- ============================================================
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

-- ============================================================
-- VERIFICATION QUERIES (optional — run after inserting to confirm)
-- ============================================================
-- SELECT user_id, user_type, full_name, email FROM app_user;
-- SELECT restaurant_id, restaurant_name, is_verified FROM restaurant;
-- SELECT meal_id, restaurant_id, name, calories FROM meal ORDER BY restaurant_id;
