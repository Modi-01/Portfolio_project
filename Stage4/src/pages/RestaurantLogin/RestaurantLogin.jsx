import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";

function RestaurantLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await loginUser(formData);
      login(data.access_token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .rl-body { background: #fafaf4; color: #1a1c19; font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; }
        .rl-main { display: flex; min-height: 100vh; }
        .rl-left { position: relative; width: 40%; background: #325f3f; display: flex; flex-direction: column; justify-content: center; padding: 0 64px; color: #fff; }
        .rl-logo-top { position: absolute; top: 48px; left: 64px; font-family: 'Hanken Grotesk', sans-serif; font-size: 24px; font-weight: 700; }
        .rl-left-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 40px; font-weight: 700; line-height: 1.2; }
        .rl-left-desc { font-size: 16px; opacity: 0.85; margin-top: 16px; max-width: 380px; }
        .rl-stats { display: flex; gap: 40px; margin-top: 40px; }
        .rl-stat-num { font-size: 28px; font-weight: 700; }
        .rl-stat-label { font-size: 12px; text-transform: uppercase; opacity: 0.8; letter-spacing: 0.05em; }
        .rl-right { width: 60%; display: flex; align-items: center; justify-content: center; padding: 48px; }
        .rl-card { width: 100%; max-width: 400px; }
        .rl-card-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 28px; font-weight: 600; }
        .rl-card-sub { font-size: 14px; color: #5e5e5b; margin-top: 4px; margin-bottom: 24px; }
        .rl-form { display: flex; flex-direction: column; gap: 16px; }
        .rl-field { display: flex; flex-direction: column; gap: 6px; }
        .rl-label { font-size: 13px; font-weight: 600; color: #414941; }
        .rl-input { width: 100%; padding: 12px 16px; border-radius: 10px; background: #f4f4ee; border: 2px solid transparent; font-size: 15px; box-sizing: border-box; font-family: inherit; }
        .rl-input:focus { outline: none; border-color: #325f3f; background: #fff; }
        .rl-error { font-size: 13px; color: #b3261e; }
        .rl-submit { width: 100%; background: #325f3f; color: #fff; height: 52px; border-radius: 9999px; border: none; font-size: 16px; font-weight: 600; cursor: pointer; }
        .rl-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .rl-footer-link { text-align: center; font-size: 14px; margin-top: 20px; }
        .rl-footer-link a { color: #325f3f; font-weight: 600; text-decoration: none; }
      `}</style>

      <div className="rl-body">
        <main className="rl-main">
          <section className="rl-left">
            <div className="rl-logo-top">Qooti</div>
            <h1 className="rl-left-title">Welcome back, partner.</h1>
            <p className="rl-left-desc">
              Sign in to manage your menu, track orders, and grow with
              thousands of health-conscious customers.
            </p>
            <div className="rl-stats">
              <div>
                <div className="rl-stat-num">500+</div>
                <div className="rl-stat-label">Active Partners</div>
              </div>
              <div>
                <div className="rl-stat-num">15k+</div>
                <div className="rl-stat-label">Monthly Users</div>
              </div>
            </div>
          </section>

          <section className="rl-right">
            <div className="rl-card">
              <h2 className="rl-card-title">Partner Login</h2>
              <p className="rl-card-sub">Sign in to your restaurant account.</p>

              <form className="rl-form" onSubmit={handleSubmit}>
                <div className="rl-field">
                  <label className="rl-label">Email</label>
                  <input className="rl-input" type="email" name="email" placeholder="owner@restaurant.com" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="rl-field">
                  <label className="rl-label">Password</label>
                  <input className="rl-input" type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                </div>

                {error && <p className="rl-error">{error}</p>}

                <button className="rl-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </button>
              </form>

              <p className="rl-footer-link">
                Don't have a restaurant account? <Link to="/restaurant-register">Register</Link>
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default RestaurantLogin;
