import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";

const SHOWCASE_ICONS = ["eco", "water_drop", "local_dining", "spa"];
const TAG_LABELS = { HighProtein: "High Protein", LowCarb: "Low Carb", GlutenFree: "Gluten Free" };
const labelizeTag = (tag) => TAG_LABELS[tag] || tag;

function Restaurants() {
  const { user, logout } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mealsByRestaurant, setMealsByRestaurant] = useState({});
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    apiGet("/api/restaurants")
      .then((data) => setRestaurants(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    restaurants.forEach((r) => {
      apiGet(`/api/restaurants/${r.restaurant_id}/meals`)
        .then((data) =>
          setMealsByRestaurant((prev) => ({ ...prev, [r.restaurant_id]: data.meals ?? [] }))
        )
        .catch(() => {});
    });
  }, [restaurants]);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .qp-body { background-color: #fafaf4; color: #1a1c19; font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; }
        .qp-nav { position: fixed; top: 0; left: 0; width: 100%; z-index: 50; background: #fafaf4; box-shadow: 0 1px 4px rgba(0,0,0,0.06); height: 80px; display: flex; align-items: center; }
        .qp-nav-inner { display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 64px; }
        .qp-logo { font-family: 'Hanken Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #325f3f; text-decoration: none; }
        .qp-nav-links { display: flex; gap: 32px; }
        .qp-nav-links a { font-size: 14px; font-weight: 600; color: #414941; text-decoration: none; transition: color 0.2s; }
        .qp-nav-links a:hover { color: #325f3f; }
        .qp-nav-links a.active { color: #325f3f; border-bottom: 2px solid #325f3f; padding-bottom: 2px; }
        .qp-btn-outline { background: none; border: none; color: #325f3f; font-size: 14px; font-weight: 600; cursor: pointer; }
        .qp-btn-primary { background: #325f3f; color: #fff; border: none; padding: 10px 24px; border-radius: 9999px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .qp-main { padding-top: 80px; min-height: 100vh; background: #fafaf4; }

        .qp-hero { max-width: 1280px; margin: 0 auto; padding: 96px 64px 64px; text-align: center; }
        .qp-hero-label { font-size: 13px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #325f3f; display: block; margin-bottom: 16px; }
        .qp-hero-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 44px; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: #1a1c19; margin-bottom: 24px; }
        .qp-hero-text { font-size: 18px; line-height: 1.6; color: #5e5e5b; max-width: 720px; margin: 0 auto; }

        .qp-showcase-section { padding: 72px 0; }
        .qp-showcase-section.alt { background: #f4f4ee; }
        .qp-showcase-inner { max-width: 1280px; margin: 0 auto; padding: 0 64px; }
        .qp-showcase-row { display: flex; gap: 56px; align-items: flex-start; margin-bottom: 56px; flex-wrap: wrap; }
        .qp-showcase-row.reverse { flex-direction: row-reverse; }
        .qp-showcase-info { flex: 1 1 400px; display: flex; flex-direction: column; gap: 20px; }
        .qp-showcase-header { display: flex; align-items: center; gap: 16px; }
        .qp-showcase-icon { width: 60px; height: 60px; border-radius: 9999px; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,0.06); flex-shrink: 0; }
        .qp-showcase-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 28px; font-weight: 600; color: #1a1c19; }
        .qp-showcase-desc { font-size: 16px; line-height: 1.7; color: #5e5e5b; }
        .qp-tag-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .qp-tag-pill { background: #e1dfdb; color: #5e5e5b; padding: 4px 16px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
        .qp-showcase-cta { align-self: flex-start; background: #325f3f; color: #fff; border: none; padding: 14px 28px; border-radius: 9999px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: opacity 0.2s; }
        .qp-showcase-cta:hover { opacity: 0.9; }
        .qp-showcase-image-wrap { flex: 1 1 400px; height: 380px; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(26,28,25,0.04); }
        .qp-showcase-image { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s ease; }
        .qp-showcase-image-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #e8f5e9, #f4f4ee); display: flex; align-items: center; justify-content: center; }
        .qp-showcase-image-wrap:hover .qp-showcase-image { transform: scale(1.04); }

        .qp-dish-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
        .qp-dish-card { background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(26,28,25,0.04); transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .qp-dish-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(26,28,25,0.08); }
        .qp-dish-img-wrap { height: 180px; overflow: hidden; }
        .qp-dish-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .qp-dish-img-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #e8f5e9, #f4f4ee); display: flex; align-items: center; justify-content: center; }
        .qp-dish-card:hover .qp-dish-img { transform: scale(1.08); }
        .qp-dish-body { padding: 20px; }
        .qp-dish-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 18px; font-weight: 600; color: #1a1c19; margin-bottom: 8px; }
        .qp-dish-stats { display: flex; gap: 16px; margin-bottom: 10px; }
        .qp-dish-stat { font-size: 12px; color: #5e5e5b; }
        .qp-dish-stat b { display: block; color: #325f3f; font-size: 14px; }
        .qp-dish-desc { font-size: 13px; color: #5e5e5b; line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

        .qp-banner-section { max-width: 1280px; margin: 0 auto; padding: 80px 64px; }
        .qp-banner { background: #325f3f; color: #fff; border-radius: 24px; padding: 56px; position: relative; overflow: hidden; }
        .qp-banner-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 28px; font-weight: 600; margin-bottom: 20px; }
        .qp-banner-text { font-size: 16px; line-height: 1.7; opacity: 0.9; max-width: 640px; margin-bottom: 28px; }
        .qp-banner-btn { background: #fff; color: #325f3f; border: none; padding: 14px 28px; border-radius: 9999px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .qp-banner-icon { position: absolute; right: -40px; bottom: -40px; font-size: 260px; opacity: 0.12; }

        .qp-loading { display: flex; align-items: center; justify-content: center; height: 60vh; font-size: 18px; color: #5e5e5b; }
        .qp-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; gap: 16px; }
        .qp-empty-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #1a1c19; }
        .qp-empty-sub { font-size: 16px; color: #5e5e5b; }
        .qp-footer { border-top: 1px solid #c1c9bf; padding: 32px 64px; max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .qp-footer-links { display: flex; gap: 24px; }
        .qp-footer-links a { font-size: 12px; color: #5e5e5b; text-decoration: none; }
        .qp-copyright { font-size: 12px; color: #5e5e5b; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; font-family: 'Material Symbols Outlined'; }
      `}</style>

      <div className="qp-body">
        {/* Navbar */}
        <nav className="qp-nav">
          <div className="qp-nav-inner">
            <Link to="/" className="qp-logo">Qooti</Link>
            <div className="qp-nav-links">
              {user?.user_type !== "restaurant" && (
                <>
                  <Link to={user ? "/dashboard" : "/restaurants"}>Meal Plans</Link>
                  <Link to="/#how-it-works">How it Works</Link>
                </>
              )}
              <Link to="/restaurants" className="active">Partners</Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {user ? (
                <>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#414941" }}>{user.full_name}</span>
                  <button className="qp-btn-primary" onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login"><button className="qp-btn-outline">Log In</button></Link>
                  <Link to="/register"><button className="qp-btn-primary">Sign Up</button></Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="qp-main">
          {loading ? (
            <div className="qp-loading">
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "#325f3f", marginRight: "12px" }}>restaurant</span>
              Loading restaurants...
            </div>
          ) : restaurants.length === 0 ? (
            <div className="qp-empty">
              <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "#c1c9bf" }}>storefront</span>
              <p className="qp-empty-title">No restaurants available yet</p>
              <p className="qp-empty-sub">Check back soon — we're adding new partners!</p>
            </div>
          ) : (
            <>
              {/* Hero */}
              <div className="qp-hero">
                <span className="qp-hero-label">Exceptional Standards</span>
                <h1 className="qp-hero-title">Our Culinary Partners</h1>
                <p className="qp-hero-text">
                  We bridge the gap between nutrition science and haute cuisine by partnering with
                  local, health-focused restaurants. Every dish is vetted for nutritional density
                  while maintaining the sophisticated artistry of a professional kitchen.
                </p>
              </div>

              {/* Restaurant showcases */}
              {restaurants.map((r, index) => {
                const meals = mealsByRestaurant[r.restaurant_id] || [];
                const previewDishes = meals.slice(0, 3);
                const tags = [...new Set(meals.flatMap((m) => m.tags || []))].slice(0, 3);
                const icon = SHOWCASE_ICONS[index % SHOWCASE_ICONS.length];

                return (
                  <section
                    key={r.restaurant_id}
                    className={`qp-showcase-section ${index % 2 === 1 ? "alt" : ""}`}
                  >
                    <div className="qp-showcase-inner">
                      <div className={`qp-showcase-row ${index % 2 === 1 ? "reverse" : ""}`}>
                        <div className="qp-showcase-info">
                          <div className="qp-showcase-header">
                            <div className="qp-showcase-icon">
                              <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#325f3f" }}>{icon}</span>
                            </div>
                            <h2 className="qp-showcase-title">{r.restaurant_name}</h2>
                          </div>

                          <p className="qp-showcase-desc">
                            {r.description || "Healthy meals delivered to your door."}
                          </p>

                          {tags.length > 0 && (
                            <div className="qp-tag-row">
                              {tags.map((tag) => (
                                <span key={tag} className="qp-tag-pill">{labelizeTag(tag)}</span>
                              ))}
                            </div>
                          )}

                          <button
                            className="qp-showcase-cta"
                            onClick={() => navigate(`/restaurants/${r.restaurant_id}/meals`)}
                          >
                            View Full Menu
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                          </button>
                        </div>

                        <div className="qp-showcase-image-wrap">
                          {r.logo_url ? (
                            <img src={r.logo_url} alt={r.restaurant_name} className="qp-showcase-image" />
                          ) : (
                            <div className="qp-showcase-image-placeholder">
                              <span className="material-symbols-outlined" style={{ fontSize: "56px", color: "#325f3f" }}>restaurant</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {previewDishes.length > 0 && (
                        <div className="qp-dish-grid">
                          {previewDishes.map((meal) => (
                            <div
                              key={meal.meal_id}
                              className="qp-dish-card"
                              onClick={() => navigate(`/restaurants/${r.restaurant_id}/meals`)}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="qp-dish-img-wrap">
                                {meal.image_url ? (
                                  <img src={meal.image_url} alt={meal.name} className="qp-dish-img" />
                                ) : (
                                  <div className="qp-dish-img-placeholder">
                                    <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "#325f3f" }}>restaurant</span>
                                  </div>
                                )}
                              </div>
                              <div className="qp-dish-body">
                                <h3 className="qp-dish-title">{meal.name}</h3>
                                <div className="qp-dish-stats">
                                  <div className="qp-dish-stat"><b>{meal.calories}</b> kcal</div>
                                  <div className="qp-dish-stat"><b>{meal.protein_g}g</b> protein</div>
                                </div>
                                <p className="qp-dish-desc">{meal.description || meal.ingredients}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}

              {/* Sourcing philosophy banner */}
              <div className="qp-banner-section">
                <div className="qp-banner">
                  <h2 className="qp-banner-title">Our Sourcing Philosophy</h2>
                  <p className="qp-banner-text">
                    We don't just partner with anyone. Every restaurant undergoes a thorough
                    quality review, ensuring they adhere to responsible sourcing, ethical
                    standards, and nutritional transparency.
                  </p>
                  <Link to="/register"><button className="qp-banner-btn">Get Started</button></Link>
                  <span className="material-symbols-outlined qp-banner-icon">nature</span>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer>
          <div className="qp-footer">
            <div className="qp-logo">Qooti</div>
            <div className="qp-footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
            <p className="qp-copyright">© 2025 Qooti. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Restaurants;
