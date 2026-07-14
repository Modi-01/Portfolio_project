import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";

function MealBrowse() {
  const { restaurantId } = useParams();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      setError("");
      try {
        const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${base}/api/restaurants/${restaurantId}/meals`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to load meals.");
        setMeals(data.meals || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [restaurantId]);

  return (
    <>
      <style>{`
        .mb-body { background: #fafaf4; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; color: #1a1c19; }
        .mb-main { max-width: 1100px; margin: 0 auto; padding: 40px 32px 64px; }
        .mb-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 28px; font-weight: 700; margin-bottom: 24px; }
        .mb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
        .mb-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(26,28,25,0.04); }
        .mb-image { width: 100%; height: 160px; background: linear-gradient(135deg, #bcefc5, #325f3f); display: flex; align-items: center; justify-content: center; font-size: 40px; }
        .mb-content { padding: 16px; }
        .mb-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
        .mb-tag { font-size: 11px; font-weight: 600; background: #eaf5ec; color: #325f3f; padding: 3px 10px; border-radius: 9999px; }
        .mb-name { font-family: 'Hanken Grotesk', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .mb-description { font-size: 13px; color: #5e5e5b; margin-bottom: 10px; }
        .mb-stats { display: flex; gap: 12px; font-size: 12px; color: #414941; }
        .mb-error { color: #b3261e; font-size: 14px; margin-bottom: 16px; }
        .mb-empty { background: #fff; border: 2px dashed #c1c9bf; border-radius: 16px; padding: 40px; text-align: center; color: #717971; }
      `}</style>

      <div className="mb-body">
        <Navbar />

        <main className="mb-main">
          <h1 className="mb-title">Menu</h1>

          {error && <p className="mb-error">{error}</p>}

          {loading ? (
            <p>Loading...</p>
          ) : meals.length === 0 ? (
            <div className="mb-empty">No meals available from this restaurant yet.</div>
          ) : (
            <div className="mb-grid">
              {meals.map((meal) => (
                <div className="mb-card" key={meal.meal_id}>
                  <div className="mb-image">🍽️</div>
                  <div className="mb-content">
                    <div className="mb-tags">
                      {(meal.tags || []).map((tag) => (
                        <span key={tag} className="mb-tag">{tag}</span>
                      ))}
                    </div>
                    <div className="mb-name">{meal.name}</div>
                    <p className="mb-description">{meal.description}</p>
                    <div className="mb-stats">
                      <span>{meal.calories} kcal</span>
                      <span>{meal.protein_g}g protein</span>
                      <span>{meal.carbs_g}g carbs</span>
                      <span>{meal.fats_g}g fat</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default MealBrowse;
