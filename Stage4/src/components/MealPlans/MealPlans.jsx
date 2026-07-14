import { useNavigate } from "react-router-dom";
import "./MealPlans.css";

import meal1 from "../../assets/Plan 1.png";
import meal2 from "../../assets/Plan 2.png";
import meal3 from "../../assets/Plan 3.png";

function MealPlans() {
  const navigate = useNavigate();

  const meals = [
    {
      image: meal1,
      title: "The Lean Protocol",
      description:
        "Optimized for fat loss while maintaining muscle mass. Low-carb,high-protein.",
      price: 46.9,
      tag1: "High Protein",
      tag2: "Weight Loss",
    },
    {
      image: meal2,
      title: "The Performance Peak",
      description:
        "Calorie-dense, balanced macros for athletes and those looking to gain muscle.",
      price: 52.5,
      tag1: "High Calories",
      tag2: "Muscle Gain",
    },
    {
      image: meal3,
      title: "The Vitality Garden",
      description:
        "Creative vegetarian and vegan dishes that never compromise on flavor.",
      price: 44.05,
      tag1: "Plant Based",
      tag2: "Vegetarian",
    },
  ];

  return (
    <section className="meal-plans">

      <div className="meal-header">

        <div className="meal-title">

          <h2>Featured Meal Plans</h2>

          <p>
            Find the perfect balance for your lifestyle.
            Each plan is designed by nutritionists and
            executed by five-star chefs.
          </p>

        </div>

        <div className="meal-toggle">

          <button className="active">Weekly</button>

        </div>

      </div>

      <div className="meal-grid">

        {meals.map((meal, index) => {
          return (
            <div className="meal-card" key={index}>

              <img
                src={meal.image}
                alt={meal.title}
                className="meal-image"
              />

              <div className="meal-content">

                <div className="meal-tags">

                  <span>{meal.tag1}</span>

                  <span>{meal.tag2}</span>

                </div>

                <h3>{meal.title}</h3>

                <p>{meal.description}</p>

                <div className="meal-footer">

                  <span className="price">
                    SAR {meal.price.toFixed(2)}
                    <small>/meal</small>
                  </span>

                  <button className="select-btn" onClick={() => navigate("/weekly-selection")}>
                    Select →
                  </button>

                </div>

              </div>

            </div>
          );
        })}

      </div>

    </section>
  );
}

export default MealPlans;
