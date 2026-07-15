import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authRequest } from "../../services/auth";

function MyMeals() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMeals = async () => {
    setLoading(true);
    setError("");
    try {
      const { restaurant } = await authRequest("/api/restaurants/me");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/restaurants/${restaurant.restaurant_id}/meals`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to load meals.");
      setMeals(data.meals || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleDelete = async (mealId) => {
    if (!window.confirm("Delete this meal?")) return;
    try {
      await authRequest(`/api/meals/${mealId}`, "DELETE");
      setMeals((prev) => prev.filter((m) => m.meal_id !== mealId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (meal) => {
    navigate(`/restaurant/meals/${meal.meal_id}/edit`, { state: { meal } });
  };

  return (
    <>
      <style>{`
        .mm-body { background: #fafaf4; min-height: 100vh; padding: 48px 64px; font-family: 'Plus Jakarta Sans', sans-serif; color: #1a1c19; }
        .mm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .mm-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 28px; font-weight: 700; }
        .mm-add-btn { background: #325f3f; color: #fff; border: none; border-radius: 9999px; padding: 12px 22px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }
        .mm-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(26,28,25,0.04); }
        .mm-table th { background: #f4f4ee; text-align: left; padding: 14px 16px; font-size: 13px; font-weight: 600; color: #414941; }
        .mm-table td { padding: 14px 16px; border-top: 1px solid #eceee9; font-size: 14px; vertical-align: top; }
        .mm-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .mm-tag { font-size: 11px; font-weight: 600; background: #eaf5ec; color: #325f3f; padding: 3px 10px; border-radius: 9999px; }
        .mm-btn { border: none; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; margin-right: 8px; }
        .mm-edit-btn { background: #f4f4ee; color: #414941; }
        .mm-delete-btn { background: #fdecea; color: #b3261e; }
        .mm-error { color: #b3261e; font-size: 14px; margin-bottom: 16px; }
        .mm-empty { background: #fff; border: 2px dashed #c1c9bf; border-radius: 16px; padding: 40px; text-align: center; color: #717971;}
      `}</style>

      <div className="mm-body">
        <div className="mm-header">
          <h1 className="mm-title">My Meals</h1>
          <Link to="/restaurant/meals/new" className="mm-add-btn">+ Add Meal</Link>
        </div>

        {error && <p className="mm-error">{error}</p>}

        {loading ? (
          <p>Loading...</p>
        ) : meals.length === 0 ? (
          <div className="mm-empty">No meals yet. Click "Add Meal" to create your first one.</div>
        ) : (
          <table className="mm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Calories</th>
                <th>Protein / Carbs / Fats</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meals.map((meal) => (
                <tr key={meal.meal_id}>
                  <td>{meal.name}</td>
                  <td>{meal.calories} kcal</td>
                  <td>{meal.protein_g}g / {meal.carbs_g}g / {meal.fats_g}g</td>
                  <td>
                    <div className="mm-tags">
                      {(meal.tags || []).map((tag) => (
                        <span key={tag} className="mm-tag">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button className="mm-btn mm-edit-btn" onClick={() => handleEdit(meal)}>Edit</button>
                    <button className="mm-btn mm-delete-btn" onClick={() => handleDelete(meal.meal_id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default MyMeals;
