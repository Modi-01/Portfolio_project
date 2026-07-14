from fastapi import APIRouter, HTTPException, Depends
from database import get_db_connection
from auth import get_current_user
from schemas import (
    MealCreateRequest,
    MealUpdateRequest,
    MealResponse,
    MealSelectionsCreateRequest
)

router = APIRouter(
    prefix="/api",
    tags=["Meals"]
)

# Retrieves all available meals for a specific restaurant.
@router.get("/restaurants/{restaurant_id}/meals")
def get_restaurant_meals(restaurant_id: int):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the restaurant exists
        cursor.execute(
            """
            SELECT restaurant_id
            FROM restaurant
            WHERE restaurant_id = %s;
            """,
            (restaurant_id,)
        )

        restaurant = cursor.fetchone()

        if not restaurant:
            raise HTTPException(
                status_code=404,
                detail="Restaurant not found."
            )

        # Retrieve all available meals for the restaurant
        cursor.execute(
            """
            SELECT
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
            FROM meal
            WHERE restaurant_id = %s
              AND is_available = TRUE
            ORDER BY meal_id DESC;
            """,
            (restaurant_id,)
        )

        meals = cursor.fetchall()

        return {
            "restaurant_id": restaurant_id,
            "meals": meals
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Allows a restaurant owner to create a new meal.
@router.post("/meals", response_model=MealResponse)
def create_meal(
    meal: MealCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    conn = None
    cursor = None

    try:
        # Validate string fields
        if (
            meal.name.strip() == ""
            or meal.description.strip() == ""
            or meal.ingredients.strip() == ""
            or meal.image_url.strip() == ""
        ):
            raise HTTPException(
                status_code=400,
                detail="Name, description, ingredients, and image_url are required."
            )

        # Validate tags
        if not meal.tags:
            raise HTTPException(
                status_code=400,
                detail="At least one tag is required."
            )

        for tag in meal.tags:
            if tag.strip() == "":
                raise HTTPException(
                    status_code=400,
                    detail="Tags cannot contain empty values."
                )

        # Validate numeric fields
        if (
            meal.calories < 0
            or meal.protein_g < 0
            or meal.carbs_g < 0
            or meal.fats_g < 0
        ):
            raise HTTPException(
                status_code=400,
                detail="Calories, protein_g, carbs_g, and fats_g cannot be negative."
            )

        conn = get_db_connection()
        cursor = conn.cursor()

        # Only restaurant users can create meals
        if current_user["user_type"] != "restaurant":
            raise HTTPException(
                status_code=403,
                detail="Only restaurant users can create meals."
            )

        # Check that this restaurant belongs to the logged-in user
        cursor.execute(
            """
            SELECT restaurant_id
            FROM restaurant
            WHERE restaurant_id = %s
              AND user_id = %s;
            """,
            (meal.restaurant_id, current_user["user_id"])
        )

        restaurant = cursor.fetchone()

        if not restaurant:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to add meals to this restaurant."
            )

        cursor.execute(
            """
            INSERT INTO meal (
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
                is_available
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, TRUE)
            RETURNING meal_id;
            """,
            (
                meal.restaurant_id,
                meal.name,
                meal.description,
                meal.ingredients,
                meal.calories,
                meal.protein_g,
                meal.carbs_g,
                meal.fats_g,
                meal.image_url,
                meal.tags
            )
        )

        new_meal = cursor.fetchone()
        conn.commit()

        return {
            "message": f"Meal created successfully. Meal ID: {new_meal['meal_id']}"
        }

    except HTTPException:
        raise

    except Exception as e:
        if conn:
            conn.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Allows a restaurant owner to update one of their existing meals.
@router.put("/meals/{meal_id}", response_model=MealResponse)
def update_meal(
    meal_id: int,
    meal: MealUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    conn = None
    cursor = None

    try:
        # Validate string fields if provided
        if meal.name is not None and meal.name.strip() == "":
            raise HTTPException(status_code=400, detail="Meal name cannot be empty.")

        if meal.description is not None and meal.description.strip() == "":
            raise HTTPException(status_code=400, detail="Description cannot be empty.")

        if meal.ingredients is not None and meal.ingredients.strip() == "":
            raise HTTPException(status_code=400, detail="Ingredients cannot be empty.")

        if meal.image_url is not None and meal.image_url.strip() == "":
            raise HTTPException(status_code=400, detail="Image URL cannot be empty.")

        # Validate numeric fields if provided
        if meal.calories is not None and meal.calories < 0:
            raise HTTPException(status_code=400, detail="Calories cannot be negative.")

        if meal.protein_g is not None and meal.protein_g < 0:
            raise HTTPException(status_code=400, detail="Protein cannot be negative.")

        if meal.carbs_g is not None and meal.carbs_g < 0:
            raise HTTPException(status_code=400, detail="Carbs cannot be negative.")

        if meal.fats_g is not None and meal.fats_g < 0:
            raise HTTPException(status_code=400, detail="Fats cannot be negative.")

        # Validate tags if provided
        if meal.tags is not None:
            if len(meal.tags) == 0:
                raise HTTPException(
                    status_code=400,
                    detail="At least one tag is required."
                )

            for tag in meal.tags:
                if tag.strip() == "":
                    raise HTTPException(
                        status_code=400,
                        detail="Tags cannot contain empty values."
                    )

        conn = get_db_connection()
        cursor = conn.cursor()

        # Only restaurant users can update meals
        if current_user["user_type"] != "restaurant":
            raise HTTPException(
                status_code=403,
                detail="Only restaurant users can update meals."
            )

        # Check that the meal belongs to the logged-in restaurant user
        cursor.execute(
            """
            SELECT m.meal_id
            FROM meal m
            JOIN restaurant r
                ON m.restaurant_id = r.restaurant_id
            WHERE m.meal_id = %s
              AND r.user_id = %s;
            """,
            (meal_id, current_user["user_id"])
        )

        existing_meal = cursor.fetchone()

        if not existing_meal:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to update this meal."
            )

        cursor.execute(
            """
            UPDATE meal
            SET
                name = COALESCE(%s, name),
                description = COALESCE(%s, description),
                ingredients = COALESCE(%s, ingredients),
                calories = COALESCE(%s, calories),
                protein_g = COALESCE(%s, protein_g),
                carbs_g = COALESCE(%s, carbs_g),
                fats_g = COALESCE(%s, fats_g),
                image_url = COALESCE(%s, image_url),
                tags = COALESCE(%s, tags)
            WHERE meal_id = %s;
            """,
            (
                meal.name,
                meal.description,
                meal.ingredients,
                meal.calories,
                meal.protein_g,
                meal.carbs_g,
                meal.fats_g,
                meal.image_url,
                meal.tags,
                meal_id
            )
        )

        conn.commit()

        return {
            "message": "Meal updated successfully."
        }

    except HTTPException:
        raise

    except Exception as e:
        if conn:
            conn.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Allows a restaurant owner to soft delete one of their meals by marking it as unavailable.
@router.delete("/meals/{meal_id}", response_model=MealResponse)
def delete_meal(
    meal_id: int,
    current_user: dict = Depends(get_current_user)
):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Only restaurant users can delete meals
        if current_user["user_type"] != "restaurant":
            raise HTTPException(
                status_code=403,
                detail="Only restaurant users can delete meals."
            )

        # Check that the meal belongs to the logged-in restaurant user
        cursor.execute(
            """
            SELECT m.meal_id
            FROM meal m
            JOIN restaurant r
                ON m.restaurant_id = r.restaurant_id
            WHERE m.meal_id = %s
              AND r.user_id = %s;
            """,
            (meal_id, current_user["user_id"])
        )

        existing_meal = cursor.fetchone()

        if not existing_meal:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to delete this meal."
            )

        # Soft delete
        cursor.execute(
            """
            UPDATE meal
            SET is_available = FALSE
            WHERE meal_id = %s;
            """,
            (meal_id,)
        )

        conn.commit()

        return {
            "message": "Meal deleted successfully."
        }

    except HTTPException:
        raise

    except Exception as e:
        if conn:
            conn.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Allows a client to save their weekly meal selections for a subscription.
@router.post("/meal-selections")
def create_meal_selections(
    request: MealSelectionsCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    conn = None
    cursor = None

    try:
        if current_user["user_type"] != "client":
            raise HTTPException(
                status_code=403,
                detail="Only clients can select meals."
            )

        if not request.selections:
            raise HTTPException(
                status_code=400,
                detail="At least one meal selection is required."
            )

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT subscription_id, user_id, start_date, end_date, status
            FROM subscription
            WHERE subscription_id = %s;
            """,
            (request.subscription_id,)
        )

        subscription = cursor.fetchone()

        if not subscription:
            raise HTTPException(
                status_code=404,
                detail="Subscription not found."
            )

        if subscription["user_id"] != current_user["user_id"]:
            raise HTTPException(
                status_code=403,
                detail="You can only select meals for your own subscription."
            )

        if subscription["status"] != "confirmed":
            raise HTTPException(
                status_code=400,
                detail="Cannot select meals for a cancelled subscription."
            )

        # Prevent duplicate days inside the same request
        selected_dates = []

        for item in request.selections:
            if item.day_date in selected_dates:
                raise HTTPException(
                    status_code=400,
                    detail=f"Duplicate meal selection for date {item.day_date}."
                )

            selected_dates.append(item.day_date)

            # Validate day_date is inside subscription range
            if not (
                subscription["start_date"] <= item.day_date <= subscription["end_date"]
            ):
                raise HTTPException(
                    status_code=400,
                    detail=f"Date {item.day_date} is outside the subscription date range."
                )

            # Validate meal exists and available
            cursor.execute(
                """
                SELECT meal_id
                FROM meal
                WHERE meal_id = %s
                  AND is_available = TRUE;
                """,
                (item.meal_id,)
            )

            meal = cursor.fetchone()

            if not meal:
                raise HTTPException(
                    status_code=404,
                    detail=f"Meal {item.meal_id} not found or unavailable."
                )

            # Reject if this day was already selected before
            cursor.execute(
                """
                SELECT order_item_id
                FROM order_item
                WHERE subscription_id = %s
                  AND day_date = %s;
                """,
                (request.subscription_id, item.day_date)
            )

            existing_selection = cursor.fetchone()

            if existing_selection:
                raise HTTPException(
                    status_code=400,
                    detail=f"A meal has already been selected for {item.day_date}."
                )

        created_items = []

        for item in request.selections:
            cursor.execute(
                """
                INSERT INTO order_item (
                    subscription_id,
                    meal_id,
                    day_date,
                    day_of_week,
                    status
                )
                VALUES (%s, %s, %s, %s, 'confirmed')
                RETURNING order_item_id;
                """,
                (
                    request.subscription_id,
                    item.meal_id,
                    item.day_date,
                    item.day_of_week
                )
            )

            new_item = cursor.fetchone()
            created_items.append(new_item["order_item_id"])

        conn.commit()

        return {
            "message": "Meal selections saved successfully.",
            "created_order_item_ids": created_items
        }

    except HTTPException:
        if conn:
            conn.rollback()
        raise

    except Exception as e:
        if conn:
            conn.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Retrieves all confirmed orders for a specific restaurant on a selected day.
@router.get("/restaurants/{restaurant_id}/orders")
def get_restaurant_orders(
    restaurant_id: int,
    day: str,
    current_user: dict = Depends(get_current_user)
):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if current_user["user_type"] != "restaurant":
            raise HTTPException(
                status_code=403,
                detail="Only restaurant users can view restaurant orders."
            )

        cursor.execute(
            """
            SELECT restaurant_id
            FROM restaurant
            WHERE restaurant_id = %s
              AND user_id = %s;
            """,
            (restaurant_id, current_user["user_id"])
        )

        restaurant = cursor.fetchone()

        if not restaurant:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to view orders for this restaurant."
            )

        cursor.execute(
            """
            SELECT
                oi.order_item_id,
                oi.subscription_id,
                oi.day_date,
                oi.day_of_week,
                oi.status,
                m.meal_id,
                m.name AS meal_name,
                u.user_id AS client_id,
                u.full_name AS client_name,
                u.phone AS client_phone,
                u.address AS delivery_address,
                s.delivery_time
            FROM order_item oi
            JOIN meal m
                ON oi.meal_id = m.meal_id
            JOIN subscription s
                ON oi.subscription_id = s.subscription_id
            JOIN app_user u
                ON s.user_id = u.user_id
            WHERE m.restaurant_id = %s
              AND oi.day_of_week = %s
              AND oi.status = 'confirmed'
            ORDER BY s.delivery_time, oi.day_date;
            """,
            (restaurant_id, day)
        )

        orders = cursor.fetchall()

        return {
            "restaurant_id": restaurant_id,
            "day": day,
            "orders": orders
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

