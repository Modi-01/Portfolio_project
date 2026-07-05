import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/auth";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await loginUser(formData.email, formData.password);
      
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));

      const userRole = response.user?.role || "customer";
      switch (userRole) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "restaurant":
          navigate("/restaurant/dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        .login-body { background-color: #fafaf4; color: #1a1c19; font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; }
        .login-main { display: flex; min-height: 100vh; }
        .login-left { position: relative; display: flex; width: 60%; overflow: hidden; background: #325f3f; align-items: center; justify-content: center; }
        .login-left img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.6; mix-blend-mode: overlay; }
        .login-left-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(50,95,63,0.8), transparent, rgba(50,95,63,0.2)); }
        .login-left-content { position: relative; z-index: 10; max-width: 480px; padding: 0 64px; color: #fff; }
        .login-left-tag { font-size: 14px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #bcefc5; }
        .login-left-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 48px; font-weight: 700; line-height: 1.15; margin-top: 8px; }
        .login-left-desc { font-size: 18px; margin-top: 16px; opacity: 0.9; }
        .login-left-features { display: flex; flex-direction: column; gap: 16px; margin-top: 32px; }
        .login-feature { display: flex; align-items: center; gap: 16px; }
        .login-feature-icon { width: 48px; height: 48px; border-radius: 50%; background: rgba(188,239,197,0.2); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .login-feature-title { font-size: 14px; font-weight: 600; color: #bcefc5; }
        .login-feature-desc { font-size: 16px; opacity: 0.8; }
        .login-logo-top { position: absolute; top: 64px; left: 64px; font-family: 'Hanken Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #bcefc5; }
        .login-right { display: flex; flex-direction: column; width: 40%; background: #fafaf4; padding: 32px 64px; justify-content: center; }
        .login-right-inner { max-width: 400px; margin: 0 auto; width: 100%; }
        .login-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 32px; font-weight: 600; color: #1a1c19; margin-bottom: 8px; }
        .login-subtitle { font-size: 16px; color: #414941; margin-bottom: 32px; }
        .login-form { display: flex; flex-direction: column; gap: 20px; }
        .login-field { display: flex; flex-direction: column; gap: 6px; }
        .login-label { font-size: 14px; font-weight: 600; color: #1a1c19; }
        .login-label-row { display: flex; justify-content: space-between; align-items: center; }
        .login-forgot { font-size: 12px; font-weight: 500; color: #325f3f; text-decoration: none; }
        .login-forgot:hover { text-decoration: underline; }
        .login-input { width: 100%; height: 48px; padding: 0 16px; border-radius: 12px; background: #f4f4ee; border: 2px solid transparent; font-size: 16px; color: #1a1c19; transition: border-color 0.2s, background 0.2s; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
        .login-input:focus { outline: none; border-color: #325f3f; background: #fff; }
        .login-input.error { border-color: #dc3545; background: #fff5f5; }
        .login-pass-wrap { position: relative; }
        .login-pass-toggle { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #717971; display: flex; align-items: center; }
        .login-pass-toggle:hover { color: #1a1c19; }
        .login-hint { font-size: 12px; color: #717971; margin-top: 4px; }
        .login-error { background: #f8d7da; color: #721c24; padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 8px; border: 1px solid #f5c6cb; display: flex; align-items: center; }
        .login-submit { width: 100%; background: #325f3f; color: #fff; height: 56px; border-radius: 9999px; border: none; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s, transform 0.1s; font-family: 'Plus Jakarta Sans', sans-serif; }
        .login-submit:hover:not(:disabled) { background: #4a7856; box-shadow: 0 8px 24px rgba(50,95,63,0.2); }
        .login-submit:active:not(:disabled) { transform: scale(0.98); }
        .login-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .login-footer-link { text-align: center; font-size: 16px; color: #414941; margin-top: 24px; }
        .login-footer-link a { color: #325f3f; font-weight: 600; text-decoration: none; margin-left: 4px; }
        .login-footer-link a:hover { text-decoration: underline; }
        .login-brand-footer { margin-top: 32px; font-size: 12px; color: #717971; text-align: center; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; font-family: 'Material Symbols Outlined'; font-size: 20px; }
        .spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 0.6s ease-in-out infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="login-body">
        <main className="login-main">
          <section className="login-left">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKAg4327IKegqLjj16tcd4Zyiop5azwdsk8kC7kTAh-YNPCh8fwz0SAvk478V1AMqkOYuXwwdz0EKm4r5O5Tn9X9xeaNogYY5k9M82gPR82nDBFxbGeZLWBlxNe3gB-89R_Jlkf1adzGMqHHxFAJf-9UfWng4LcYTpyJ_KV58T7afPdRReznsVFl5dWcgWP4KVNuAF-DQBbj-R7dWPY6pAXR_abreyizK7QWa25CpYosWsUBGNLzCkvUREeMv8FbeMM94V8uBcW1w" alt="Healthy meal" />
            <div className="login-left-overlay" />
            <div className="login-logo-top">Qooti</div>
            <div className="login-left-content">
              <span className="login-left-tag">The Science of Nutrition</span>
              <h1 className="login-left-title">Elevate your daily ritual.</h1>
              <p className="login-left-desc">Experience the effortless intersection of clinical precision and culinary mastery.</p>
              <div className="login-left-features">
                <div className="login-feature">
                  <div className="login-feature-icon">
                    <span className="material-symbols-outlined" style={{ color: "#bcefc5" }}>restaurant</span>
                  </div>
                  <div>
                    <p className="login-feature-title">Chef-Curated Menus</p>
                    <p className="login-feature-desc">Gourmet meals tailored to your biomarkers.</p>
                  </div>
                </div>
                <div className="login-feature">
                  <div className="login-feature-icon">
                    <span className="material-symbols-outlined" style={{ color: "#bcefc5" }}>bolt</span>
                  </div>
                  <div>
                    <p className="login-feature-title">Performance Tracking</p>
                    <p className="login-feature-desc">Real-time adjustments based on your activity data.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="login-right">
            <div className="login-right-inner">
              <h2 className="login-title">Welcome back</h2>
              <p className="login-subtitle">Sign in to your account to continue your wellness journey.</p>

              <form className="login-form" onSubmit={handleSubmit}>
                {error && (
                  <div className="login-error">
                    <span className="material-symbols-outlined" style={{ fontSize: "18px", marginRight: "8px" }}>error</span>
                    {error}
                  </div>
                )}

                <div className="login-field">
                  <label className="login-label">Email Address</label>
                  <input 
                    className="login-input" 
                    type="email" 
                    name="email" 
                    placeholder="name@example.com" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    disabled={loading}
                  />
                </div>

                <div className="login-field">
                  <div className="login-label-row">
                    <label className="login-label">Password</label>
                    <a href="#" className="login-forgot" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
                  </div>
                  <div className="login-pass-wrap">
                    <input 
                      className="login-input" 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      placeholder="••••••••" 
                      value={formData.password} 
                      onChange={handleChange} 
                      style={{ paddingRight: "48px" }} 
                      required 
                      disabled={loading}
                    />
                    <button 
                      type="button" 
                      className="login-pass-toggle" 
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                  <p className="login-hint">Must be at least 8 characters.</p>
                </div>

                <button className="login-submit" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner" style={{ marginRight: "8px" }}></span>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <p className="login-footer-link">
                Don't have an account?
                <Link to="/register">Sign Up</Link>
              </p>

              <div className="login-brand-footer">
                <p>© 2025 Qooti. All rights reserved.</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default Login;