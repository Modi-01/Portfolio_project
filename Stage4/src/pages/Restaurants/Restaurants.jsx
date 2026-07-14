import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet } from "../../services/auth";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiGet("/api/restaurants")
      .then((data) => setRestaurants(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        .qp-btn-outline { background: none; border: none; color: #325f3f; font-size: 14px; font-weight: 600; cursor: pointer; }
        .qp-btn-primary { background: #325f3f; color: #fff; border: none; padding: 10px 24px; border-radius: 9999px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .qp-main { padding-top: 80px; min-height: 100vh; background: #fafaf4; }
        .qp-header { max-width: 1280px; margin: 0 auto; padding: 48px 64px 32px; }
        .qp-headline { font-family: 'Hanken Grotesk', sans-serif; font-size: 40px; font-weight: 700; color: #1a1c19; margin-bottom: 8px; }
        .qp-subtext { font-size: 16px; color: #5e5e5b; }
        .qp-grid { max-width: 1280px; margin: 0 auto; padding: 0 64px 64px; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .qp-card { background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(26,28,25,0.04); border: 1px solid rgba(193,201,191,0.2); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .qp-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(26,28,25,0.1); }
        .qp-card-img { width: 100%; height: 180px; object-fit: cover; background: #f4f4ee; display: flex; align-items: center; justify-content: center; }
        .qp-card-img-placeholder { width: 100%; height: 180px; background: linear-gradient(135deg, #e8f5e9, #f4f4ee); display: flex; align-items: center; justify-content: center; }
        .qp-card-body { padding: 24px; }
        .qp-card-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: #1a1c19; margin-bottom: 8px; }
        .qp-card-desc { font-size: 14px; color: #5e5e5b; line-height: 1.6; margin-bottom: 20px; }
        .qp-card-btn { width: 100%; background: #325f3f; color: #fff; border: none; padding: 12px; border-radius: 9999px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s; }
        .qp-card-btn:hover { background: #4a7856; }
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
              <Link to="/restaurants">Meal Plans</Link>
              <a href="#">Pricing</a>
              <a href="#">How it Works</a>
              <a href="#">About</a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link to="/login"><button className="qp-btn-outline">Log In</button></Link>
              <Link to="/register"><button className="qp-btn-primary">Sign Up</button></Link>
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
              <div className="qp-header">
                <h1 className="qp-headline">Our Restaurant Partners</h1>
                <p className="qp-subtext">Explore our curated selection of healthy restaurants and find your perfect meal.</p>
              </div>
              <div className="qp-grid">
                {restaurants.map((r) => (
                  <div
                    key={r.restaurant_id}
                    className="qp-card"
                    onClick={() => navigate(`/restaurants/${r.restaurant_id}/meals`)}
                  >
                    {r.logo_url ? (
                      <img src={r.logo_url} alt={r.restaurant_name} className="qp-card-img" />
                    ) : (
                      <div className="qp-card-img-placeholder">
                        <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "#325f3f" }}>restaurant</span>
                      </div>
                    )}
                    <div className="qp-card-body">
                      <h2 className="qp-card-title">{r.restaurant_name}</h2>
                      <p className="qp-card-desc">{r.description || "Healthy meals delivered to your door."}</p>
                      <button className="qp-card-btn">
                        View Meals
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
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
              <a href="#">Contact Us</a>
            </div>
            <p className="qp-copyright">© 2025 Qooti. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Restaurants;