import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";

const DAYS = [
  { key: "sun", label: "SUN", date: 12, full: "Sunday" },
  { key: "mon", label: "MON", date: 13, full: "Monday" },
  { key: "tue", label: "TUE", date: 14, full: "Tuesday" },
  { key: "wed", label: "WED", date: 15, full: "Wednesday" },
  { key: "thu", label: "THU", date: 16, full: "Thursday" },
];

const MOCK_MEALS = {
  sun: { name: "Miso-Glazed Atlantic Salmon", restaurant: "The Green Kitchen • Signature Series", tags: ["High Protein", "Low Carb"], calories: 540, protein: 42, fat: 22, price: 18.5 },
  mon: { name: "Golden Harvest Buddha Bowl", restaurant: "The Green Kitchen", tags: ["Vegan"], calories: 410, protein: 18, fat: 14, price: 14.0 },
  tue: { name: "Grass-Fed Sirloin & Asparagus", restaurant: "The Ocean's Harvest", tags: ["High Protein"], calories: 620, protein: 48, fat: 26, price: 21.5 },
  wed: { name: "Provencal Herb Chicken", restaurant: "The Green Kitchen", tags: ["Low Carb"], calories: 480, protein: 39, fat: 18, price: 16.0 },
  thu: { name: "Silken Tofu & Avocado", restaurant: "The Ocean's Harvest", tags: ["Vegan", "Low Carb"], calories: 390, protein: 20, fat: 24, price: 15.5 },
};

function WeeklyMealSelection() {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState("sun");
  const [selections, setSelections] = useState({ ...MOCK_MEALS });

  const handleRemove = (dayKey) => {
    setSelections((prev) => {
      const next = { ...prev };
      delete next[dayKey];
      return next;
    });
  };

  const selectedCount = Object.keys(selections).length;
  const totalCalories = Object.values(selections).reduce((sum, m) => sum + m.calories, 0);
  const estimatedTotal = Object.values(selections).reduce((sum, m) => sum + m.price, 0);
  const allSelected = selectedCount === DAYS.length;
  const activeMeal = selections[activeDay];
  const activeDayInfo = DAYS.find((d) => d.key === activeDay);

  const handleReviewOrder = () => {
    if (!allSelected) return;
    navigate("/order-summary");
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
        .wms-tags { display: flex; gap: 6px; margin-bottom: 8px; }
        .wms-tag { font-size: 11px; font-weight: 600; background: #eaf5ec; color: #325f3f; padding: 3px 10px; border-radius: 9999px; }
        .wms-meal-name { font-family: 'Hanken Grotesk', sans-serif; font-size: 18px; font-weight: 700; }
        .wms-meal-restaurant { font-size: 12px; color: #717971; margin-top: 2px; }
        .wms-meal-stats { display: flex; gap: 16px; margin-top: 10px; font-size: 12px; color: #414941; }
        .wms-meal-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 12px; }
        .wms-price { font-family: 'Hanken Grotesk', sans-serif; font-size: 18px; font-weight: 700; }
        .wms-change-btn { background: #f4f4ee; border: none; border-radius: 9999px; padding: 6px 16px; font-size: 12px; font-weight: 600; color: #325f3f; cursor: pointer; }
        .wms-empty { background: #fff; border: 2px dashed #c1c9bf; border-radius: 16px; padding: 40px; text-align: center; color: #717971; margin-bottom: 24px; }
        .wms-banner { background: #1a1c19; border-radius: 16px; padding: 24px; color: #fff; }
        .wms-banner-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .wms-banner-desc { font-size: 13px; opacity: 0.8; }

        .wms-summary { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(26,28,25,0.04); position: sticky; top: 24px; }
        .wms-summary-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 16px; }
        .wms-summary-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 10px; color: #414941; }
        .wms-summary-row strong { color: #1a1c19; }
        .wms-progress-label { display: flex; justify-content: space-between; font-size: 12px; color: #414941; margin-top: 12px; margin-bottom: 4px; }
        .wms-progress-bar { height: 6px; background: #f4f4ee; border-radius: 9999px; overflow: hidden; }
        .wms-progress-fill { height: 100%; background: #325f3f; border-radius: 9999px; }
        .wms-total-row { display: flex; justify-content: space-between; font-family: 'Hanken Grotesk', sans-serif; font-size: 18px; font-weight: 700; margin: 16px 0; padding-top: 12px; border-top: 1px solid #eceee9; }
        .wms-review-btn { width: 100%; background: #325f3f; color: #fff; border: none; height: 50px; border-radius: 9999px; font-size: 15px; font-weight: 600; cursor: pointer; }
        .wms-review-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .wms-consult { background: #eaf5ec; border-radius: 16px; padding: 20px; margin-top: 16px; }
        .wms-consult-title { font-size: 13px; font-weight: 700; color: #1a1c19; }
        .wms-consult-desc { font-size: 12px; color: #414941; margin: 6px 0 10px; }
        .wms-consult-link { font-size: 13px; font-weight: 700; color: #325f3f; background: none; border: none; cursor: pointer; padding: 0; }
      `}</style>

      <div className="wms-body">
        <Navbar />

        <main className="wms-main">
          <div>
            <h1 className="wms-title">Weekly Selection</h1>
            <p className="wms-subtitle">
              Curate your nutritional journey for the upcoming week. Balance your macros with chef-prepared precision.
            </p>

            <div className="wms-tabs">
              {DAYS.map((day) => (
                <div
                  key={day.key}
                  className={`wms-tab ${activeDay === day.key ? "active" : ""} ${selections[day.key] ? "filled" : ""}`}
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
                    {activeMeal.tags.map((tag) => (
                      <span key={tag} className="wms-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="wms-meal-name">{activeMeal.name}</div>
                  <div className="wms-meal-restaurant">{activeMeal.restaurant}</div>
                  <div className="wms-meal-stats">
                    <span>{activeMeal.calories} kcal</span>
                    <span>{activeMeal.protein}g protein</span>
                    <span>{activeMeal.fat}g fat</span>
                  </div>
                  <div className="wms-meal-footer">
                    <span className="wms-price">SAR {activeMeal.price.toFixed(2)}</span>
                    <button className="wms-change-btn" onClick={() => handleRemove(activeDay)}>
                      Change
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="wms-empty">No meal selected for {activeDayInfo.full} yet.</div>
            )}

            <div className="wms-banner">
              <div className="wms-banner-title">Sustainable Sourcing</div>
              <div className="wms-banner-desc">
                Every meal is crafted using 100% organic, locally sourced ingredients from our partner farms.
              </div>
            </div>
          </div>

          <aside className="wms-summary">
            <div className="wms-summary-title">Weekly Summary</div>

            <div className="wms-summary-row">
              <span>Meals Selected</span>
              <strong>{selectedCount}/{DAYS.length}</strong>
            </div>
            <div className="wms-summary-row">
              <span>Total Calories</span>
              <strong>{totalCalories.toLocaleString()} kcal</strong>
            </div>
            <div className="wms-summary-row">
              <span>Delivery Date</span>
              <strong>Sunday, next week</strong>
            </div>

            <div className="wms-progress-label">
              <span>Target Protein</span>
              <span>85%</span>
            </div>
            <div className="wms-progress-bar">
              <div className="wms-progress-fill" style={{ width: "85%" }} />
            </div>

            <div className="wms-progress-label">
              <span>Fiber Goal</span>
              <span>92%</span>
            </div>
            <div className="wms-progress-bar">
              <div className="wms-progress-fill" style={{ width: "92%" }} />
            </div>

            <div className="wms-total-row">
              <span>Estimated Total</span>
              <span>SAR {estimatedTotal.toFixed(2)}</span>
            </div>

            <button className="wms-review-btn" disabled={!allSelected} onClick={handleReviewOrder}>
              Review My Order
            </button>

            <div className="wms-consult">
              <div className="wms-consult-title">Need a consultation?</div>
              <div className="wms-consult-desc">
                Chat with our resident nutritionist to optimize your weekly macros.
              </div>
              <button className="wms-consult-link">Start Chat →</button>
            </div>
          </aside>
        </main>
      </div>
    </>
  );
}

export default WeeklyMealSelection;
