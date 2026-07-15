import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../services/auth";
import "./MealPlans.css";

const PLAN_PRICE = 250.0;
const TAG_LABELS = { HighProtein: "High Protein", LowCarb: "Low Carb", GlutenFree: "Gluten Free" };
const labelizeTag = (tag) => TAG_LABELS[tag] || tag;

function MealPlans() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/restaurants")
      .then(async (restaurants) => {
        if (!restaurants || restaurants.length === 0) return [];
        const data = await apiGet(`/api/restaurants/${restaurants[0].restaurant_id}/meals`);
        return data.meals || [];
      })
      .then((data) => setMeals(data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || meals.length === 0) return null;

  return (
    <section className="meal-plans" id="meal-plans">

      <div className="meal-header">

        <div className="meal-title">

          <h2>Featured Meal Plans</h2>

          <p>
            Find the perfect balance for your lifestyle.
            Each plan is designed by nutritionists and
            executed by five-star chefs.
          </p>

        </div>

      </div>

      <div className="meal-grid">

        {meals.map((meal) => (
          <div className="meal-card" key={meal.meal_id}>

            {meal.image_url ? (
              <img
                src={meal.image_url}
                alt={meal.name}
                className="meal-image"
              />
            ) : (
              <div className="meal-image" style={{ background: "#e8f5e9" }} />
            )}

            <div className="meal-content">

              <div className="meal-tags">

                {(meal.tags || []).slice(0, 2).map((tag) => (
                  <span key={tag}>{labelizeTag(tag)}</span>
                ))}

              </div>

              <h3>{meal.name}</h3>

              <p>{meal.description}</p>

              <div className="meal-footer">

                <span className="price">
                  SAR {PLAN_PRICE.toFixed(2)}
                  <small>/week</small>
                </span>

                <button className="select-btn" onClick={() => navigate("/restaurants")}>
                  Select →
                </button>

              </div>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}

export default MealPlans;
