import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authRequest } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";

function MyMeals() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const totalMeals = meals.length;
  const avgCalories = totalMeals ? Math.round(meals.reduce((sum, m) => sum + m.calories, 0) / totalMeals) : 0;
  const avgProtein = totalMeals ? Math.round(meals.reduce((sum, m) => sum + Number(m.protein_g), 0) / totalMeals) : 0;
  const uniqueTags = new Set(meals.flatMap((m) => m.tags || [])).size;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }
        .mm-body { background: #fafaf4; font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; display: flex; color: #1a1c19; }

        .mm-sidebar { width: 240px; background: #fff; border-right: 1px solid #e8ebe8; display: flex; flex-direction: column; padding: 24px 0; position: fixed; height: 100vh; }
        .mm-logo { font-family: 'Hanken Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: #325f3f; padding: 0 20px 20px; border-bottom: 1px solid #e8ebe8; }
        .mm-logo small { display: block; font-size: 11px; font-weight: 500; color: #717971; margin-top: 2px; }
        .mm-nav { display: flex; flex-direction: column; gap: 4px; padding: 16px 10px; flex: 1; }
        .mm-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; font-size: 14px; font-weight: 500; color: #414941; text-decoration: none; }
        .mm-nav-item:hover { background: #f4f4ee; color: #325f3f; }
        .mm-nav-item.active { background: #e8f5e9; color: #325f3f; font-weight: 600; }
        .mm-add-sidebar-btn { margin: 8px 10px; background: #325f3f; color: #fff; border: none; border-radius: 9999px; padding: 10px 16px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; text-align: center; }
        .mm-sidebar-footer { padding: 12px 20px; border-top: 1px solid #e8ebe8; }
        .mm-logout-btn { background: none; border: none; color: #b3261e; font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; }

        .mm-main { margin-left: 240px; flex: 1; padding: 32px 40px; }
        .mm-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
        .mm-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 26px; font-weight: 700; margin-bottom: 4px; }
        .mm-subtitle { font-size: 14px; color: #5e5e5b; max-width: 480px; }
        .mm-user { font-size: 13px; color: #414941; font-weight: 600; }

        .mm-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .mm-stat-card { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #e8ebe8; }
        .mm-stat-value { font-family: 'Hanken Grotesk', sans-serif; font-size: 26px; font-weight: 700; color: #1a1c19; margin-bottom: 4px; }
        .mm-stat-label { font-size: 12px; color: #5e5e5b; font-weight: 500; }

        .mm-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(26,28,25,0.04); }
        .mm-table th { background: #f4f4ee; text-align: left; padding: 14px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #717971; }
        .mm-table td { padding: 14px 16px; border-top: 1px solid #eceee9; font-size: 14px; vertical-align: top; }
        .mm-meal-name { font-weight: 600; margin-bottom: 2px; }
        .mm-meal-desc { font-size: 12px; color: #717971; }
        .mm-macros { color: #414941; }
        .mm-tags { display: flex; gap: 6px; flex-wrap: wrap; max-width: 220px; }
        .mm-tag { font-size: 11px; font-weight: 600; background: #eaf5ec; color: #325f3f; padding: 3px 10px; border-radius: 9999px; white-space: nowrap; }
        .mm-btn { border: none; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; margin-right: 8px; }
        .mm-edit-btn { background: #f4f4ee; color: #414941; }
        .mm-delete-btn { background: #fdecea; color: #b3261e; }
        .mm-error { color: #b3261e; font-size: 14px; margin-bottom: 16px; }
        .mm-empty { background: #fff; border: 2px dashed #c1c9bf; border-radius: 16px; padding: 40px; text-align: center; color: #717971; }
        .material-symbols-outlined { font-variation-settings: 'FILL'0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; font-family: 'Material Symbols Outlined'; }
      `}</style>

      <div className="mm-body">
        <aside className="mm-sidebar">
          <div className="mm-logo">
            Qooti
            <small>Partner Portal</small>
          </div>
          <nav className="mm-nav">
            <Link to="/restaurant/meals" className="mm-nav-item active">
              <span className="material-symbols-outlined">restaurant_menu</span>
              My Meals
            </Link>
            <Link to="/restaurant/orders" className="mm-nav-item">
              <span className="material-symbols-outlined">receipt_long</span>
              Orders
            </Link>
          </nav>
          <Link to="/restaurant/meals/new" className="mm-add-sidebar-btn">+ Add New Meal</Link>
          <div className="mm-sidebar-footer">
            <button className="mm-logout-btn" onClick={handleLogout}>Log Out</button>
          </div>
        </aside>

        <main className="mm-main">
          <div className="mm-header">
            <div>
              <h1 className="mm-title">My Meals</h1>
              <p className="mm-subtitle">Manage your restaurant's menu and track nutritional data at a glance.</p>
            </div>
            {user && <span className="mm-user">{user.full_name}</span>}
          </div>

          {error && <p className="mm-error">{error}</p>}

          {!loading && meals.length > 0 && (
            <div className="mm-stats-grid">
              <div className="mm-stat-card">
                <div className="mm-stat-value">{totalMeals}</div>
                <div className="mm-stat-label">Total Meals</div>
              </div>
              <div className="mm-stat-card">
                <div className="mm-stat-value">{avgCalories}</div>
                <div className="mm-stat-label">Avg. Calories</div>
              </div>
              <div className="mm-stat-card">
                <div className="mm-stat-value">{avgProtein}g</div>
                <div className="mm-stat-label">Avg. Protein</div>
              </div>
              <div className="mm-stat-card">
                <div className="mm-stat-value">{uniqueTags}</div>
                <div className="mm-stat-label">Menu Tags</div>
              </div>
            </div>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : meals.length === 0 ? (
            <div className="mm-empty">No meals yet. Click "Add New Meal" to create your first one.</div>
          ) : (
            <table className="mm-table">
              <thead>
                <tr>
                  <th>Meal</th>
                  <th>Calories</th>
                  <th>Macros (P/C/F)</th>
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {meals.map((meal) => (
                  <tr key={meal.meal_id}>
                    <td>
                      <div className="mm-meal-name">{meal.name}</div>
                      <div className="mm-meal-desc">{meal.description}</div>
                    </td>
                    <td>{meal.calories} kcal</td>
                    <td className="mm-macros">P:{meal.protein_g}g &nbsp; C:{meal.carbs_g}g &nbsp; F:{meal.fats_g}g</td>
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
        </main>
      </div>
    </>
  );
}

export default MyMeals;
