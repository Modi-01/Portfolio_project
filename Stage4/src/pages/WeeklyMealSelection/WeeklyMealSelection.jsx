import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { apiGet } from "../../services/auth";

// Flat weekly plan price — pricing lives on the subscription, not on meals
// (backend ORIGINAL_PRICE). Meals carry nutrition info only.
const PLAN_PRICE = 500.0;

const toIso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

// Subscription week = next Sunday through Thursday.
function buildWeek() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilSunday = (7 - today.getDay()) % 7 || 7;
  const sunday = new Date(today);
  sunday.setDate(today.getDate() + daysUntilSunday);

  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  return names.map((full, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return {
      key: full.toLowerCase().slice(0, 3),
      label: full.slice(0, 3).toUpperCase(),
      full,
      date: d.getDate(),
      iso: toIso(d),
    };
  });
}

function WeeklyMealSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurant");

  const days = useMemo(buildWeek, []);
  const [activeDay, setActiveDay] = useState(days[0].key);
  const [meals, setMeals] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // A restaurant must be chosen first — send the user to pick one.
  useEffect(() => {
    if (!restaurantId) navigate("/restaurants");
  }, [restaurantId, navigate]);

  useEffect(() => {
    if (!restaurantId) return;
    apiGet(`/api/restaurants/${restaurantId}`)
      .then(setRestaurant)
      .catch(() => {});
    apiGet(`/api/restaurants/${restaurantId}/meals`)
      .then((data) => setMeals(data.meals ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const handleSelect = (meal) => {
    setSelections((prev) => ({ ...prev, [activeDay]: meal }));
    // Convenience: jump to the next unfilled day.
    const idx = days.findIndex((d) => d.key === activeDay);
    const next = days
      .slice(idx + 1)
      .concat(days.slice(0, idx))
      .find((d) => !selections[d.key] && d.key !== activeDay);
    if (next) setActiveDay(next.key);
  };

  const handleRemove = (dayKey) => {
    setSelections((prev) => {
      const next = { ...prev };
      delete next[dayKey];
      return next;
    });
  };

  const selectedCount = Object.keys(selections).length;
  const totalCalories = Object.values(selections).reduce(
    (sum, m) => sum + (m.calories || 0),
    0
  );
  const allSelected = selectedCount === days.length;
  const activeMeal = selections[activeDay];
  const activeDayInfo = days.find((d) => d.key === activeDay);

  const handleReviewOrder = () => {
    if (!allSelected) return;
    navigate("/order-summary", {
      state: {
        restaurantId: Number(restaurantId),
        restaurantName: restaurant?.restaurant_name || "",
        startDate: days[0].iso,
        endDate: days[days.length - 1].iso,
        days: days.map((d) => ({
          full: d.full,
          iso: d.iso,
          meal_id: selections[d.key].meal_id,
          name: selections[d.key].name,
          calories: selections[d.key].calories,
        })),
      },
    });
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .wms-body { background: #fafaf4; color: #1a1c19; font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; }
        .wms-main { max-width: 1200px; margin: 0 auto; padding: 40px 32px 64px; display: grid; grid-template-columns: 2fr 1fr; gap: 32px; align-items: start; }
        .wms-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 32px; font-weight: 700; }
        .wms-subtitle { font-size: 15px; color: #5e5e5b; margin-top: 6px; margin-bottom: 24px; }
        .wms-tabs { display: flex; gap: 10px; margin-bottom: 24px; }
        .wms-tab { flex: 1; text-align: center; padding: 12px 4px; border-radius: 12px; background: #f4f4ee; cursor: pointer; border: 2px solid transparent; }
        .wms-tab.active { background: #325f3f; color: #fff; }
        .wms-tab.filled:not(.active) { border-color: #bcefc5; }
        .wms-tab-label { font-size: 11px; font-weight: 700; letter-spacing: 0.05em; opacity: 0.8; }
        .wms-tab-date { font-size: 18px; font-weight: 700; margin-top: 2px; }
        .wms-section-title { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
        .wms-meal-card { background: #fff; border-radius: 16px; padding: 16px; display: flex; gap: 16px; box-shadow: 0 4px 20px rgba(26,28,25,0.04); margin-bottom: 24px; }
        .wms-meal-img { width: 140px; height: 140px; border-radius: 12px; flex-shrink: 0; background: linear-gradient(135deg, #bcefc5, #325f3f); display: flex; align-items: center; justify-content: center; font-size: 40px; }
        .wms-meal-info { flex: 1; display: flex; flex-direction: column; }
        .wms-tags { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
        .wms-tag { font-size: 11px; font-weight: 600; background: #eaf5ec; color: #325f3f; padding: 3px 10px; border-radius: 9999px; }
        .wms-meal-name { font-family: 'Hanken Grotesk', sans-serif; font-size: 18px; font-weight: 700; }
        .wms-meal-restaurant { font-size: 12px; color: #717971; margin-top: 2px; }
        .wms-meal-stats { display: flex; gap: 16px; margin-top: 10px; font-size: 12px; color: #414941; }
        .wms-meal-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 12px; }
        .wms-change-btn { background: #f4f4ee; border: none; border-radius: 9999px; padding: 6px 16px; font-size: 12px; font-weight: 600; color: #325f3f; cursor: pointer; }
        .wms-empty { background: #fff; border: 2px dashed #c1c9bf; border-radius: 16px; padding: 24px; text-align: center; color: #717971; margin-bottom: 24px; }
        .wms-pick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .wms-pick-card { background: #fff; border-radius: 14px; padding: 14px; box-shadow: 0 4px 20px rgba(26,28,25,0.04); border: 2px solid transparent; display: flex; flex-direction: column; gap: 6px; }
        .wms-pick-card.chosen { border-color: #325f3f; }
        .wms-pick-name { font-size: 14px; font-weight: 700; }
        .wms-pick-stats { font-size: 12px; color: #414941; display: flex; gap: 10px; }
        .wms-pick-btn { align-self: flex-start; margin-top: 4px; background: #325f3f; color: #fff; border: none; border-radius: 9999px; padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .wms-pick-btn.chosen { background: #eaf5ec; color: #325f3f; }
        .wms-error { background: #fdecea; color: #b3261e; border-radius: 12px; padding: 14px 16px; font-size: 13px; margin-bottom: 20px; }

        .wms-summary { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(26,28,25,0.04); position: sticky; top: 24px; }
        .wms-summary-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 16px; }
        .wms-summary-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 10px; color: #414941; }
        .wms-summary-row strong { color: #1a1c19; }
        .wms-total-row { display: flex; justify-content: space-between; font-family: 'Hanken Grotesk', sans-serif; font-size: 18px; font-weight: 700; margin: 16px 0; padding-top: 12px; border-top: 1px solid #eceee9; }
        .wms-review-btn { width: 100%; background: #325f3f; color: #fff; border: none; height: 50px; border-radius: 9999px; font-size: 15px; font-weight: 600; cursor: pointer; }
        .wms-review-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .wms-plan-note { font-size: 12px; color: #717971; margin-top: 12px; text-align: center; }
      `}</style>

      <div className="wms-body">
        <Navbar />

        <main className="wms-main">
          <div>
            <h1 className="wms-title">Weekly Selection</h1>
            <p className="wms-subtitle">
              {restaurant
                ? `Pick one meal per day from ${restaurant.restaurant_name} for next week (Sunday to Thursday).`
                : "Pick one meal per day for next week (Sunday to Thursday)."}
            </p>

            {error && <div className="wms-error">{error}</div>}

            <div className="wms-tabs">
              {days.map((day) => (
                <div
                  key={day.key}
                  className={`wms-tab ${activeDay === day.key ? "active" : ""} ${
                    selections[day.key] ? "filled" : ""
                  }`}
                  onClick={() => setActiveDay(day.key)}
                >
                  <div className="wms-tab-label">{day.label}</div>
                  <div className="wms-tab-date">{day.date}</div>
                </div>
              ))}
            </div>

            <p className="wms-section-title">{activeDayInfo.full} Selection</p>

            {activeMeal ? (
              <div className="wms-meal-card">
                <div className="wms-meal-img">🍽️</div>
                <div className="wms-meal-info">
                  <div className="wms-tags">
                    {(activeMeal.tags || []).map((tag) => (
                      <span key={tag} className="wms-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="wms-meal-name">{activeMeal.name}</div>
                  <div className="wms-meal-restaurant">
                    {restaurant?.restaurant_name}
                  </div>
                  <div className="wms-meal-stats">
                    <span>{activeMeal.calories} kcal</span>
                    <span>{activeMeal.protein_g}g protein</span>
                    <span>{activeMeal.carbs_g}g carbs</span>
                    <span>{activeMeal.fats_g}g fat</span>
                  </div>
                  <div className="wms-meal-footer">
                    <span />
                    <button
                      className="wms-change-btn"
                      onClick={() => handleRemove(activeDay)}
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="wms-empty">
                No meal selected for {activeDayInfo.full} yet — choose one below.
              </div>
            )}

            <p className="wms-section-title">Available Meals</p>
            {loading ? (
              <div className="wms-empty">Loading meals…</div>
            ) : meals.length === 0 ? (
              <div className="wms-empty">
                This restaurant has no available meals right now.
              </div>
            ) : (
              <div className="wms-pick-grid">
                {meals.map((meal) => {
                  const chosen = activeMeal?.meal_id === meal.meal_id;
                  return (
                    <div
                      key={meal.meal_id}
                      className={`wms-pick-card ${chosen ? "chosen" : ""}`}
                    >
                      <div className="wms-pick-name">{meal.name}</div>
                      <div className="wms-pick-stats">
                        <span>{meal.calories} kcal</span>
                        <span>{meal.protein_g}g protein</span>
                      </div>
                      <div className="wms-tags">
                        {(meal.tags || []).map((tag) => (
                          <span key={tag} className="wms-tag">{tag}</span>
                        ))}
                      </div>
                      <button
                        className={`wms-pick-btn ${chosen ? "chosen" : ""}`}
                        onClick={() => handleSelect(meal)}
                      >
                        {chosen
                          ? "Selected ✓"
                          : `Choose for ${activeDayInfo.label}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="wms-summary">
            <div className="wms-summary-title">Weekly Summary</div>

            <div className="wms-summary-row">
              <span>Meals Selected</span>
              <strong>{selectedCount}/{days.length}</strong>
            </div>
            <div className="wms-summary-row">
              <span>Total Calories</span>
              <strong>{totalCalories.toLocaleString()} kcal</strong>
            </div>
            <div className="wms-summary-row">
              <span>Week Starts</span>
              <strong>{days[0].full} {days[0].iso}</strong>
            </div>

            <div className="wms-total-row">
              <span>Weekly Plan</span>
              <span>SAR {PLAN_PRICE.toFixed(2)}</span>
            </div>

            <button
              className="wms-review-btn"
              disabled={!allSelected}
              onClick={handleReviewOrder}
            >
              {allSelected
                ? "Review My Order"
                : `Select ${days.length - selectedCount} more meal${
                    days.length - selectedCount > 1 ? "s" : ""
                  }`}
            </button>

            <p className="wms-plan-note">
              One flat weekly price — Sunday to Thursday lunch, delivery included.
            </p>
          </aside>
        </main>
      </div>
    </>
  );
}

export default WeeklyMealSelection;
