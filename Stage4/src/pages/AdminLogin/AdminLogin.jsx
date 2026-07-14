import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
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

      if (data.user.user_type !== "admin") {
        setError("This portal is for authorized administrators only.");
        return;
      }

      login(data.access_token, data.user);
      navigate("/admin/dashboard");
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
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .al-body { background: #fafaf4; color: #1a1c19; font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
        .al-nav { position: sticky; top: 0; z-index: 50; background: #fafaf4; box-shadow: 0 1px 4px rgba(0,0,0,0.06); height: 80px; display: flex; align-items: center; }
        .al-nav-inner { display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 64px; }
        .al-logo { font-family: 'Hanken Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #325f3f; text-decoration: none; }
        .al-nav-links { display: flex; gap: 32px; }
        .al-nav-links a { font-size: 14px; font-weight: 500; color: #5e5e5b; text-decoration: none; transition: color 0.2s; }
        .al-nav-links a:hover { color: #325f3f; }
        .al-nav-actions { display: flex; align-items: center; gap: 16px; }
        .al-btn-outline { background: none; border: none; color: #5e5e5b; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; }
        .al-btn-primary { background: #325f3f; color: #fff; border: none; padding: 10px 24px; border-radius: 9999px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; }

        .al-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 32px 20px; position: relative; overflow: hidden; }
        .al-blob-1 { position: absolute; top: -10%; left: -5%; width: 40%; height: 60%; background: #a1d2aa; border-radius: 9999px; filter: blur(120px); opacity: 0.2; pointer-events: none; }
        .al-blob-2 { position: absolute; bottom: -10%; right: -5%; width: 30%; height: 50%; background: #e6e2d7; border-radius: 9999px; filter: blur(100px); opacity: 0.2; pointer-events: none; }

        .al-card { width: 100%; max-width: 440px; background: #fff; box-shadow: 0 4px 20px rgba(26,28,25,0.04); border-radius: 24px; padding: 32px; position: relative; z-index: 1; }
        .al-icon { width: 48px; height: 48px; border-radius: 9999px; background: rgba(74,120,86,0.1); color: #325f3f; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .al-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #325f3f; text-align: center; letter-spacing: -0.01em; }
        .al-subtitle { font-size: 14px; color: #5e5e5b; text-align: center; margin-top: 8px; margin-bottom: 24px; }

        .al-form { display: flex; flex-direction: column; gap: 16px; }
        .al-field { display: flex; flex-direction: column; gap: 8px; }
        .al-label-row { display: flex; justify-content: space-between; align-items: center; }
        .al-label { font-size: 14px; font-weight: 600; color: #414941; }
        .al-forgot { font-size: 12px; color: #325f3f; text-decoration: none; }
        .al-forgot:hover { text-decoration: underline; }
        .al-input { width: 100%; height: 56px; padding: 0 16px; background: #f4f4ee; border: 2px solid transparent; border-radius: 12px; font-size: 15px; font-family: inherit; color: #1a1c19; box-sizing: border-box; transition: border-color 0.2s; }
        .al-input:focus { outline: none; border-color: #325f3f; }
        .al-pass-wrap { position: relative; }
        .al-pass-toggle { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #717971; display: flex; align-items: center; }
        .al-pass-toggle:hover { color: #325f3f; }
        .al-remember-row { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
        .al-remember-row input { width: 18px; height: 18px; accent-color: #325f3f; cursor: pointer; }
        .al-remember-row label { font-size: 15px; color: #5e5e5b; cursor: pointer; }
        .al-error { font-size: 13px; color: #b3261e; background: #fdecea; border-radius: 10px; padding: 10px 14px; }

        .al-submit { width: 100%; height: 56px; background: #325f3f; color: #fff; border: none; border-radius: 9999px; font-size: 14px; font-weight: 700; letter-spacing: 0.02em; cursor: pointer; box-shadow: 0 8px 24px rgba(50,95,63,0.2); transition: background 0.2s; margin-top: 8px; }
        .al-submit:hover { background: #4a7856; }
        .al-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .al-warning { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e6e2d7; text-align: center; }
        .al-warning p { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: rgba(186,26,26,0.8); display: flex; align-items: center; justify-content: center; gap: 6px; }

        .al-footer { background: #2f312e; margin-top: auto; }
        .al-footer-inner { max-width: 1280px; margin: 0 auto; padding: 32px 64px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .al-footer-logo { font-family: 'Hanken Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: #bcefc5; margin-bottom: 12px; }
        .al-footer-desc { font-size: 13px; color: #c1c9bf; opacity: 0.8; }
        .al-footer-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #bcefc5; margin-bottom: 12px; letter-spacing: 0.05em; }
        .al-footer-links { display: flex; flex-direction: column; gap: 8px; }
        .al-footer-links a { font-size: 13px; color: #c1c9bf; opacity: 0.8; text-decoration: none; }
        .al-footer-links a:hover { opacity: 1; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; font-family: 'Material Symbols Outlined'; }
      `}</style>

      <div className="al-body">
        <nav className="al-nav">
          <div className="al-nav-inner">
            <Link to="/" className="al-logo">Qooti</Link>
            <div className="al-nav-links">
              <a href="#">Meal Plans</a>
              <a href="#">Customization</a>
              <a href="#">Pricing</a>
            </div>
            <div className="al-nav-actions">
              <Link to="/login" className="al-btn-outline">Login</Link>
              <Link to="/register" className="al-btn-primary">Sign Up</Link>
            </div>
          </div>
        </nav>

        <main className="al-main">
          <div className="al-blob-1" />
          <div className="al-blob-2" />

          <div className="al-card">
            <div className="al-icon">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            </div>
            <h1 className="al-title">Admin Portal — Qooti</h1>
            <p className="al-subtitle">Welcome back. Please authenticate to access the dashboard.</p>

            <form className="al-form" onSubmit={handleSubmit}>
              <div className="al-field">
                <label className="al-label" htmlFor="email">Email Address</label>
                <input
                  className="al-input"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="admin@qooti_admin.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="al-field">
                <div className="al-label-row">
                  <label className="al-label" htmlFor="password">Password</label>
                  <a href="#" className="al-forgot">Forgot password?</a>
                </div>
                <div className="al-pass-wrap">
                  <input
                    className="al-input"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ paddingRight: "48px" }}
                    required
                  />
                  <button
                    type="button"
                    className="al-pass-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="al-remember-row">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember this session</label>
              </div>

              {error && <p className="al-error">{error}</p>}

              <button className="al-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing In..." : "Login as Admin"}
              </button>
            </form>

            <div className="al-warning">
              <p>
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>warning</span>
                This portal is for authorized administrators only.
              </p>
            </div>
          </div>
        </main>

        <footer className="al-footer">
          <div className="al-footer-inner">
            <div>
              <div className="al-footer-logo">Qooti</div>
              <p className="al-footer-desc">© 2026 Qooti. Effortless Health.</p>
            </div>
            <div>
              <div className="al-footer-title">Company</div>
              <div className="al-footer-links">
                <a href="#">About</a>
                <a href="#">Contact</a>
              </div>
            </div>
            <div>
              <div className="al-footer-title">Support</div>
              <div className="al-footer-links">
                <a href="#">FAQ</a>
                <a href="#">Security</a>
              </div>
            </div>
            <div>
              <div className="al-footer-title">Legal</div>
              <div className="al-footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Use</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default AdminLogin;
