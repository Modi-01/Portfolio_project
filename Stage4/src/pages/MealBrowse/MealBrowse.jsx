import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

function MealBrowse() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    // Fetch restaurant details
    fetch(`http://127.0.0.1:8000/api/restaurants/${restaurantId}`)
      .then((res) => res.json())
      .then((data) => setRestaurant(data))
      .catch(() => {});

    // Fetch meals
    fetch(`http://127.0.0.1:8000/api/restaurants/${restaurantId}/meals`)
      .then((res) => res.json())
        .then((data) => {
        setMeals(data.meals);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [restaurantId]);

  const filters = ["all", "Keto", "Vegan", "HighProtein", "LowCarb", "GlutenFree", "Vegetarian"];

  const filteredMeals = activeFilter === "all"
    ? meals
    : meals.filter((m) => m.tags && m.tags.includes(activeFilter));

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fafaf4; font-family: 'Plus Jakarta Sans', sans-serif; color: #1a1c19; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; font-family: 'Material Symbols Outlined'; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pill-shadow { box-shadow: 0px 4px 20px rgba(26,28,25,0.04); }
        .pill-shadow-hover:hover { box-shadow: 0px 8px 30px rgba(26,28,25,0.08); }
        .meal-card { transition: all 0.3s ease; }
        .meal-card:hover { transform: translateY(-4px); }
        .meal-img { transition: transform 0.5s ease; }
        .meal-card:hover .meal-img { transform: scale(1.05); }
      `}</style>

      <div style={{ background: "#fafaf4", minHeight: "100vh" }}>

        {/* Navbar */}
        <header style={{ background: "#fafaf4", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", height: "80px", display: "flex", alignItems: "center" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 64px", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <Link to="/" style={{ fontFamily: "Hanken Grotesk", fontSize: "24px", fontWeight: 700, color: "#325f3f", textDecoration: "none" }}>Qooti</Link>
            <nav style={{ display: "flex", gap: "32px" }}>
              <Link to="/restaurants" style={{ fontSize: "14px", fontWeight: 600, color: "#325f3f", textDecoration: "none", borderBottom: "2px solid #325f3f", paddingBottom: "2px" }}>Meal Plans</Link>
              <a href="#" style={{ fontSize: "14px", fontWeight: 500, color: "#5e5e5b", textDecoration: "none" }}>Customization</a>
              <a href="#" style={{ fontSize: "14px", fontWeight: 500, color: "#5e5e5b", textDecoration: "none" }}>Pricing</a>
            </nav>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <Link to="/login" style={{ fontSize: "14px", fontWeight: 600, color: "#5e5e5b", textDecoration: "none" }}>Login</Link>
              <Link to="/register" style={{ background: "#325f3f", color: "#fff", padding: "10px 24px", borderRadius: "9999px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Sign Up</Link>
            </div>
          </div>
        </header>

        {/* Main */}
        <main style={{ minHeight: "100vh" }}>
          <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 64px 80px" }}>

            {/* Back button */}
            <button
              onClick={() => navigate("/restaurants")}
              style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#325f3f", fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "32px" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
              Back to Restaurants
            </button>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h1 style={{ fontFamily: "Hanken Grotesk", fontSize: "48px", fontWeight: 700, color: "#1a1c19", marginBottom: "16px", letterSpacing: "-0.02em" }}>
                {restaurant ? restaurant.restaurant_name : "Fuel Your Potential"}
              </h1>
              <p style={{ fontSize: "18px", color: "#5e5e5b", maxWidth: "640px", margin: "0 auto 48px" }}>
                {restaurant ? restaurant.description : "Precision-engineered nutrition tailored to your lifestyle."}
              </p>

              {/* Filter chips */}
              <div style={{ display: "flex", overflowX: "auto", gap: "8px", justifyContent: "center", marginBottom: "48px", paddingBottom: "8px" }} className="hide-scrollbar">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    style={{
                      padding: "12px 24px",
                      borderRadius: "9999px",
                      fontSize: "14px",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s",
                      background: activeFilter === f ? "#325f3f" : "#e1dfdb",
                      color: activeFilter === f ? "#fff" : "#5e5e5b",
                    }}
                  >
                    {f === "all" ? "All Meals" : f === "HighProtein" ? "High Protein" : f === "LowCarb" ? "Low Carb" : f === "GlutenFree" ? "Gluten Free" : f}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Cards */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#5e5e5b", fontSize: "18px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "#325f3f", display: "block", marginBottom: "16px" }}>restaurant</span>
                Loading meals...
              </div>
            ) : filteredMeals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#5e5e5b" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "#c1c9bf", display: "block", marginBottom: "16px" }}>no_meals</span>
                <p style={{ fontSize: "24px", fontFamily: "Hanken Grotesk", fontWeight: 700, color: "#1a1c19", marginBottom: "8px" }}>No meals found</p>
                <p style={{ fontSize: "16px" }}>Try a different filter.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "32px" }}>
                {filteredMeals.map((meal) => (
                  <div key={meal.meal_id} className="meal-card pill-shadow pill-shadow-hover" style={{ background: "#fff", borderRadius: "24px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <div style={{ height: "256px", overflow: "hidden", position: "relative" }}>
                      {meal.image_url ? (
                        <img className="meal-img" src={meal.image_url} alt={meal.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #e8f5e9, #f4f4ee)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "#325f3f" }}>restaurant</span>
                        </div>
                      )}
                      {meal.tags && meal.tags.length > 0 && (
                        <div style={{ position: "absolute", top: "16px", left: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {meal.tags.slice(0, 2).map((tag) => (
                            <span key={tag} style={{ background: "#e4e2dd", color: "#474744", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 500 }}>
                              {tag === "HighProtein" ? "High Protein" : tag === "LowCarb" ? "Low Carb" : tag === "GlutenFree" ? "Gluten Free" : tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "32px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                      <h3 style={{ fontFamily: "Hanken Grotesk", fontSize: "22px", fontWeight: 700, color: "#1a1c19", marginBottom: "8px" }}>{meal.name}</h3>
                      <p style={{ fontSize: "14px", color: "#5e5e5b", marginBottom: "24px", lineHeight: 1.6 }}>{meal.description || meal.ingredients}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#414941" }}>
                          <span style={{ fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>restaurant</span>
                            {meal.calories} kcal
                          </span>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "#325f3f" }}>SAR {meal.price}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#414941" }}>
                          <span style={{ fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>bolt</span>
                            P: {meal.protein_g}g · C: {meal.carbs_g}g · F: {meal.fats_g}g
                          </span>
                        </div>
                      </div>
                      <button
                        style={{ marginTop: "auto", width: "100%", background: "#325f3f", color: "#fff", padding: "16px", borderRadius: "9999px", border: "none", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
                        onMouseOver={(e) => e.target.style.background = "#4a7856"}
                        onMouseOut={(e) => e.target.style.background = "#325f3f"}
                      >
                        Select This Meal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer style={{ background: "#2f312e" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 64px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <span style={{ fontFamily: "Hanken Grotesk", fontSize: "20px", fontWeight: 700, color: "#bcefc5" }}>Qooti</span>
            <p style={{ fontSize: "12px", color: "#9e9e9e" }}>Redefining health through precision, simplicity, and quiet elegance.</p>
            <div style={{ display: "flex", gap: "24px" }}>
              <a href="#" style={{ fontSize: "12px", color: "#9e9e9e", textDecoration: "none" }}>Privacy</a>
              <a href="#" style={{ fontSize: "12px", color: "#9e9e9e", textDecoration: "none" }}>Terms</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default MealBrowse;