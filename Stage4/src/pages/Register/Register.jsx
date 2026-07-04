import { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    healthGoal: "",
    homeAddress: "",
    workAddress: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register:", formData);
  };

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .qp-body { background-color: #fafaf4; color: #1a1c19; font-family: 'Plus Jakarta Sans', sans-serif; }
        .qp-nav { position: fixed; top: 0; left: 0; width: 100%; z-index: 50; background: #fafaf4; box-shadow: 0 1px 4px rgba(0,0,0,0.06); height: 80px; display: flex; align-items: center; }
        .qp-nav-inner { display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 64px; }
        .qp-logo { font-family: 'Hanken Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #325f3f; }
        .qp-nav-links { display: flex; gap: 32px; }
        .qp-nav-links a { font-size: 14px; font-weight: 600; color: #414941; text-decoration: none; transition: color 0.2s; }
        .qp-nav-links a:hover { color: #325f3f; }
        .qp-btn-outline { background: none; border: none; color: #325f3f; font-size: 14px; font-weight: 600; cursor: pointer; }
        .qp-btn-primary { background: #325f3f; color: #fff; border: none; padding: 10px 24px; border-radius: 9999px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .qp-btn-primary:hover { background: #4a7856; }
        .qp-main { padding-top: 80px; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fafaf4; position: relative; overflow: hidden; }
        .qp-bg-blob1 { position: absolute; top: -96px; right: -96px; width: 384px; height: 384px; background: rgba(188,239,197,0.2); border-radius: 50%; filter: blur(100px); }
        .qp-bg-blob2 { position: absolute; bottom: -96px; left: -96px; width: 384px; height: 384px; background: rgba(230,226,215,0.3); border-radius: 50%; filter: blur(100px); }
        .qp-grid { width: 100%; max-width: 1280px; margin: 0 auto; padding: 48px 64px; display: grid; grid-template-columns: 7fr 5fr; gap: 24px; align-items: center; }
        .qp-hero { display: flex; flex-direction: column; gap: 32px; }
        .qp-headline { font-family: 'Hanken Grotesk', sans-serif; font-size: 48px; font-weight: 700; line-height: 1.15; color: #1a1c19; }
        .qp-headline span { color: #325f3f; font-style: italic; }
        .qp-subtext { font-size: 18px; color: #5e5e5b; }
        .qp-img-wrap { position: relative; width: 100%; aspect-ratio: 16/10; overflow: hidden; border-radius: 32px; box-shadow: 0 4px 20px rgba(26,28,25,0.04); background: #fff; }
        .qp-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .qp-badges { position: absolute; bottom: 24px; left: 24px; display: flex; gap: 8px; }
        .qp-badge { background: rgba(250,250,244,0.9); backdrop-filter: blur(8px); padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 500; color: #325f3f; border: 1px solid #c1c9bf; }
        .qp-card { background: #fff; box-shadow: 0 4px 20px rgba(26,28,25,0.04); border-radius: 24px; padding: 40px; border: 1px solid rgba(193,201,191,0.1); }
        .qp-card-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 32px; font-weight: 600; color: #1a1c19; margin-bottom: 8px; }
        .qp-card-sub { font-size: 14px; font-weight: 600; color: #5e5e5b; margin-bottom: 32px; }
        .qp-form { display: flex; flex-direction: column; gap: 20px; }
        .qp-field { display: flex; flex-direction: column; gap: 6px; }
        .qp-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .qp-label { font-size: 14px; font-weight: 600; color: #414941; margin-left: 4px; }
        .qp-input { width: 100%; height: 48px; padding: 0 16px; border-radius: 12px; background: #f4f4ee; border: 2px solid transparent; font-size: 16px; color: #1a1c19; transition: border-color 0.2s, background 0.2s; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
        .qp-input:focus { outline: none; border-color: #325f3f; background: #fff; }
        .qp-select { width: 100%; height: 48px; padding: 0 16px; border-radius: 12px; background: #f4f4ee; border: 2px solid transparent; font-size: 16px; color: #1a1c19; transition: border-color 0.2s; box-sizing: border-box; appearance: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
        .qp-select:focus { outline: none; border-color: #325f3f; background: #fff; }
        .qp-submit { width: 100%; background: #325f3f; color: #fff; height: 56px; border-radius: 9999px; border: none; font-family: 'Hanken Grotesk', sans-serif; font-size: 20px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 8px 24px rgba(50,95,63,0.2); transition: background 0.2s, transform 0.1s; margin-top: 16px; }
        .qp-submit:hover { background: #4a7856; }
        .qp-submit:active { transform: scale(0.98); }
        .qp-footer-link { text-align: center; font-size: 14px; font-weight: 600; color: #5e5e5b; margin-top: 24px; }
        .qp-footer-link a { color: #325f3f; font-weight: 700; text-decoration: none; }
        .qp-footer-link a:hover { text-decoration: underline; }
        .qp-footer { padding: 48px 64px; max-width: 1280px; margin: 0 auto; border-top: 1px solid #c1c9bf; display: flex; justify-content: space-between; align-items: center; gap: 24px; flex-wrap: wrap; }
        .qp-footer-links { display: flex; gap: 32px; }
        .qp-footer-links a { font-size: 12px; font-weight: 500; color: #5e5e5b; text-decoration: none; }
        .qp-footer-links a:hover { color: #325f3f; }
        .qp-copyright { font-size: 12px; color: #5e5e5b; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; font-family: 'Material Symbols Outlined'; }
      `}</style>

      <div className="qp-body">
        {/* Navbar */}
        <nav className="qp-nav">
          <div className="qp-nav-inner">
            <div className="qp-logo">Quiet Premium</div>
            <div className="qp-nav-links">
              <a href="#">Meal Plans</a>
              <a href="#">Pricing</a>
              <a href="#">How it Works</a>
              <a href="#">About</a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button className="qp-btn-outline">Log In</button>
              <button className="qp-btn-primary">Sign Up</button>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="qp-main">
          <div className="qp-bg-blob1" />
          <div className="qp-bg-blob2" />

          <div className="qp-grid">
            {/* Left: Hero */}
            <div className="qp-hero">
              <div>
                <h1 className="qp-headline">
                  Start your journey to{" "}
                  <span>effortless</span> health.
                </h1>
                <p className="qp-subtext" style={{ marginTop: "16px" }}>
                  Join Quiet Premium today and get personalized nutrition plans
                  crafted by science and perfected by chefs.
                </p>
              </div>
              <div className="qp-img-wrap">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt_MLSFd3vuoUki1vsXyXDMs6QGd46jlko9rGGyEJfGWnC1AG9O_GY7Wc34AVuJuHuY5kTXfFxkCqSgqlS4XGFLAA9QEcAAUMaQJcuKnpZ4qwvpN57vSh8eZ2Y88cZ6tRHIbZ8MPCmYz5fLpymJVOvokIKf4bdK-vrrpNoBby2i419GctXJI70mQU7wydv0_bTCoeQ6iArb4ShaOzmsRyt9YDzuFyzUDN_lswvmN1jrGsUshaS1x1VMG72-Zejvdy9_8juccGbzzU"
                  alt="Healthy meal bowl"
                />
                <div className="qp-badges">
                  <span className="qp-badge">High Protein</span>
                  <span className="qp-badge">Organic Ingredients</span>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="qp-card">
              <h2 className="qp-card-title">Create Account</h2>
              <p className="qp-card-sub">
                Enter your details to begin your transformation.
              </p>

              <form className="qp-form" onSubmit={handleSubmit}>
                <div className="qp-field">
                  <label className="qp-label">Full Name</label>
                  <input
                    className="qp-input"
                    type="text"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="qp-field">
                  <label className="qp-label">Email Address</label>
                  <input
                    className="qp-input"
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="qp-field">
                  <label className="qp-label">Password</label>
                  <input
                    className="qp-input"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="qp-grid2">
                  <div className="qp-field">
                    <label className="qp-label">Age</label>
                    <input
                      className="qp-input"
                      type="number"
                      name="age"
                      placeholder="25"
                      value={formData.age}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="qp-field">
                    <label className="qp-label">Gender</label>
                    <select
                      className="qp-select"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="qp-grid2">
                  <div className="qp-field">
                    <label className="qp-label">Height (cm)</label>
                    <input
                      className="qp-input"
                      type="number"
                      name="height"
                      placeholder="170"
                      value={formData.height}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="qp-field">
                    <label className="qp-label">Weight (kg)</label>
                    <input
                      className="qp-input"
                      type="number"
                      name="weight"
                      placeholder="65"
                      value={formData.weight}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="qp-field">
                  <label className="qp-label">Health Goal</label>
                  <select
                    className="qp-select"
                    name="healthGoal"
                    value={formData.healthGoal}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose your primary focus</option>
                    <option value="lose_weight">Lose Weight</option>
                    <option value="maintain">Maintain Healthy Weight</option>
                    <option value="bulking">Bulking</option>
                    <option value="gaining_weight">Gaining Weight</option>
                  </select>
                </div>

                <div className="qp-field">
                  <label className="qp-label">Home Address</label>
                  <input
                    className="qp-input"
                    type="text"
                    name="homeAddress"
                    placeholder="123 Main St, Riyadh"
                    value={formData.homeAddress}
                    onChange={handleChange}
                  />
                </div>

                <div className="qp-field">
                  <label className="qp-label">Work Address</label>
                  <input
                    className="qp-input"
                    type="text"
                    name="workAddress"
                    placeholder="456 Business Ave, Riyadh"
                    value={formData.workAddress}
                    onChange={handleChange}
                  />
                </div>

                <button className="qp-submit" type="submit">
                  Create Account
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </form>

              <p className="qp-footer-link">
                Already have an account?{" "}
                <Link to="/login">Log In</Link>
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer>
          <div className="qp-footer">
            <div className="qp-logo">Quiet Premium</div>
            <div className="qp-footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact Us</a>
            </div>
            <p className="qp-copyright">© 2024 Quiet Premium. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Register;