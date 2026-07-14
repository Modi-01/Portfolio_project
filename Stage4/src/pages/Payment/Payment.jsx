import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state || {};

  const [formData, setFormData] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    saveCard: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscription_id: orderData.subscriptionId,
          amount: orderData.totalPrice || 249,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/dashboard", { state: { paymentSuccess: true } });
      } else {
        setError(data.detail || "Payment failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const meals = orderData.meals || [
    { name: "Zesty Salmon & Asparagus", restaurant: "Green Fork Bistro", price: 45, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5u_8CZb15ojHafTNf7SxtCNSqVJgi5q3ixHYu4OPXybBGoPMH8J8MSFtoZ74pkSW3_2KfSlSTmn5UgjRrOguRqCtr_lCI--Lk5gQ26cuUcYyYC3zmbMCYGzb531NZX9TbVZHRS9N6w5dc8cYEGvLqhtg4ny5RuEvRDwZk8zb1wmNbfD54Ign6ZC5il8TgkjRQNiXGJoeAMpfouPfGkP1Mt527532gYfr_KJrb4uw3kJdNiaB5vO2FqfflPd1yt2v20odtizyyUGc" },
    { name: "Truffle Forest Grains", restaurant: "Green Fork Bistro", price: 42, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwU-YFhfPBV8jSKABEBGo8TQ5PiUA5G5TGaI1ex51_YvMvoDc8rniAAwQfwNLYmbT2wCnRAqfSDfH4FVZFEjNo3rhZT05LIDAVsAUhokzJ4h5vcZs5i9HzrSTGiYaUkiOyDc4tq-kjQ_r5ai9ukTr-DNUpVhXX9gcjS4BXziyKMN31jSrhOlB4yXTOpp13pmPL11A-YQRHc67qJsJeAdKRW9BHQXcuGXOYTqnwESYsN20nTLMFlo2xMg6-jwhPeN5QDEldAbLQxjo" },
    { name: "Nordic Wild Salmon", restaurant: "The Ocean's Harvest", price: 48, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMke6hF0qSpihfDtMCVYHv8zFGXD7Cl3g7R5x2RYFSj3Ks8U1S5dGEodfsiegxo7Jl2MifjfJC4YfyEd7KKnBN174S-_fXHG1DGGAn5fa58S6dcwZMiP0QHgswxUxlrrHdJJFLRusnGwk2CvbEOfYRNYTpNWBauAfYkgQgQKKe6KJ-mX0J7im0VCDS_dLKIyLE599p_i3C0NJHM1Ep1A4d5CsVRZneNCQcwfduTQpHpJUCUInUs_GGq3aTpK9fTt4r2gV1Hb1jRAQ" },
  ];

  const subtotal = meals.reduce((sum, m) => sum + m.price, 0);
  const total = orderData.totalPrice || subtotal;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pay-body { background: #fafaf4; min-height: 100vh; display: flex; flex-direction: column; font-family: 'Plus Jakarta Sans', sans-serif; color: #1a1c19; }
        .pay-nav { background: #fafaf4; box-shadow: 0 4px 20px rgba(26,28,25,0.04); position: sticky; top: 0; z-index: 50; }
        .pay-nav-inner { display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 1280px; margin: 0 auto; padding: 16px 64px; }
        .pay-logo { font-family: 'Hanken Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #325f3f; text-decoration: none; }
        .pay-nav-links { display: flex; gap: 32px; }
        .pay-nav-links a { font-size: 16px; color: #5e5e5b; text-decoration: none; transition: color 0.2s; }
        .pay-nav-links a:hover { color: #325f3f; }
        .pay-main { flex-grow: 1; max-width: 1280px; margin: 0 auto; width: 100%; padding: 32px 64px; }
        .pay-header { margin-bottom: 32px; }
        .pay-header h1 { font-family: 'Hanken Grotesk', sans-serif; font-size: 48px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px; }
        .pay-header p { font-size: 18px; color: #5e5e5b; display: flex; align-items: center; gap: 8px; }
        .pay-grid { display: grid; grid-template-columns: 5fr 7fr; gap: 32px; }
        .pay-card { background: #fff; border-radius: 24px; padding: 32px; box-shadow: 0 4px 20px rgba(26,28,25,0.04); border: 1px solid rgba(193,201,191,0.3); }
        .pay-card h2 { font-family: 'Hanken Grotesk', sans-serif; font-size: 24px; font-weight: 600; margin-bottom: 24px; }
        .pay-plan-row { display: flex; justify-content: space-between; margin-bottom: 24px; }
        .pay-plan-label { font-size: 12px; font-weight: 500; color: #5e5e5b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .pay-plan-value { font-size: 16px; font-weight: 600; color: #1a1c19; }
        .pay-meals-title { font-size: 14px; font-weight: 600; color: #1a1c19; margin-bottom: 16px; border-top: 1px solid rgba(87,86,77,0.2); padding-top: 16px; }
        .pay-meal-item { display: flex; gap: 16px; margin-bottom: 16px; align-items: center; }
        .pay-meal-img { width: 64px; height: 64px; border-radius: 12px; overflow: hidden; flex-shrink: 0; }
        .pay-meal-img img { width: 100%; height: 100%; object-fit: cover; }
        .pay-meal-name { font-size: 16px; font-weight: 600; color: #1a1c19; }
        .pay-meal-rest { font-size: 12px; color: #5e5e5b; }
        .pay-meal-price { font-size: 16px; font-weight: 700; color: #325f3f; margin-left: auto; }
        .pay-breakdown { background: #f4f4ee; border-radius: 12px; padding: 16px; }
        .pay-breakdown-row { display: flex; justify-content: space-between; font-size: 16px; color: #5e5e5b; margin-bottom: 8px; }
        .pay-breakdown-row.free { color: #325f3f; font-weight: 500; }
        .pay-breakdown-total { display: flex; justify-content: space-between; font-family: 'Hanken Grotesk', sans-serif; font-size: 24px; font-weight: 600; color: #1a1c19; border-top: 1px solid rgba(87,86,77,0.2); padding-top: 8px; margin-top: 8px; }
        .pay-form { display: flex; flex-direction: column; gap: 16px; }
        .pay-form-group { display: flex; flex-direction: column; gap: 4px; }
        .pay-label { font-size: 14px; font-weight: 600; color: #414941; }
        .pay-input { width: 100%; background: #f4f4ee; border: none; border-radius: 12px; padding: 16px; font-size: 16px; font-family: 'Plus Jakarta Sans', sans-serif; color: #1a1c19; outline: none; transition: box-shadow 0.2s; }
        .pay-input:focus { box-shadow: 0 0 0 2px #325f3f; }
        .pay-input-wrap { position: relative; }
        .pay-input-icon { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #5e5e5b; font-family: 'Material Symbols Outlined'; }
        .pay-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .pay-checkbox-row { display: flex; align-items: center; gap: 12px; cursor: pointer; padding-top: 8px; }
        .pay-checkbox { width: 20px; height: 20px; accent-color: #325f3f; cursor: pointer; }
        .pay-checkbox-label { font-size: 16px; color: #1a1c19; }
        .pay-submit { width: 100%; background: #325f3f; color: #fff; border: none; border-radius: 9999px; padding: 16px; font-family: 'Hanken Grotesk', sans-serif; font-size: 24px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 8px 24px rgba(50,95,63,0.3); transition: background 0.2s, transform 0.1s; margin-top: 8px; }
        .pay-submit:hover { background: #4a7856; }
        .pay-submit:active { transform: scale(0.98); }
        .pay-submit:disabled { background: #c1c9bf; cursor: not-allowed; }
        .pay-trust { display: flex; align-items: center; justify-content: center; gap: 8px; color: #5e5e5b; font-size: 14px; font-weight: 600; padding-top: 16px; }
        .pay-error { background: #fce4ec; color: #c62828; padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 500; }
        .pay-footer { background: #eeeee9; border-top: 1px solid rgba(87,86,77,0.1); margin-top: 80px; }
        .pay-footer-inner { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; max-width: 1280px; margin: 0 auto; padding: 32px 64px; }
        .pay-footer-logo { font-family: 'Hanken Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #325f3f; margin-bottom: 16px; }
        .pay-footer-desc { font-size: 14px; color: #5e5e5b; }
        .pay-footer-title { font-size: 14px; font-weight: 700; margin-bottom: 16px; }
        .pay-footer-links { display: flex; flex-direction: column; gap: 8px; }
        .pay-footer-links a { font-size: 14px; color: #5e5e5b; text-decoration: underline; }
        .pay-footer-bottom { text-align: center; padding: 16px; font-size: 14px; color: #5e5e5b; border-top: 1px solid rgba(87,86,77,0.1); max-width: 1280px; margin: 0 auto; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; font-family: 'Material Symbols Outlined'; }
      `}</style>

      <div className="pay-body">
        {/* Navbar */}
        <nav className="pay-nav">
          <div className="pay-nav-inner">
            <Link to="/" className="pay-logo">Qooti</Link>
            <div className="pay-nav-links">
              <a href="#">Meal Plans</a>
              <a href="#">Pricing</a>
              <a href="#">How it Works</a>
              <a href="#">About</a>
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <Link to="/login" style={{ padding: "8px 24px", borderRadius: "9999px", fontSize: "14px", fontWeight: 600, color: "#5e5e5b", textDecoration: "none" }}>Log In</Link>
              <Link to="/register" style={{ padding: "8px 24px", borderRadius: "9999px", background: "#325f3f", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Get Started</Link>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="pay-main">
          <div className="pay-header">
            <h1>Complete Your Payment</h1>
            <p>
              <span className="material-symbols-outlined" style={{ color: "#325f3f", fontVariationSettings: "'FILL' 1" }}>shield</span>
              Secure checkout powered by Stripe
            </p>
          </div>

          <div className="pay-grid">
            {/* Left: Order Summary */}
            <div className="pay-card">
              <h2>Order Summary</h2>

              <div className="pay-plan-row">
                <div>
                  <div className="pay-plan-label">Plan Type</div>
                  <div className="pay-plan-value">{orderData.planType || "Essentials Monthly"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="pay-plan-label">Meals</div>
                  <div className="pay-plan-value">10 meals/week</div>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <div className="pay-plan-label">Delivery Address</div>
                <div style={{ fontSize: "16px", color: "#1a1c19" }}>{orderData.address || "123 Wellness Way, Riyadh"}</div>
              </div>

              <div className="pay-meals-title">Selected Meals</div>

              {meals.map((meal, i) => (
                <div key={i} className="pay-meal-item">
                  <div className="pay-meal-img">
                    {meal.image ? (
                      <img src={meal.image} alt={meal.name} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="material-symbols-outlined" style={{ color: "#325f3f" }}>restaurant</span>
                      </div>
                    )}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div className="pay-meal-name">{meal.name}</div>
                    <div className="pay-meal-rest">{meal.restaurant}</div>
                  </div>
                  <div className="pay-meal-price">SAR {meal.price}</div>
                </div>
              ))}

              <div className="pay-breakdown" style={{ marginTop: "16px" }}>
                <div className="pay-breakdown-row"><span>Subtotal</span><span>SAR {subtotal}</span></div>
                <div className="pay-breakdown-row free"><span>Delivery Fee</span><span>FREE</span></div>
                <div className="pay-breakdown-total"><span>Total</span><span>SAR {total}</span></div>
              </div>
            </div>

            {/* Right: Payment Form */}
            <div>
              <div className="pay-card" style={{ position: "sticky", top: "112px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                  <h2 style={{ margin: 0 }}>Payment Details</h2>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span className="material-symbols-outlined" style={{ color: "#5e5e5b", fontSize: "24px" }}>credit_card</span>
                    <span className="material-symbols-outlined" style={{ color: "#5e5e5b", fontSize: "24px" }}>account_balance_wallet</span>
                  </div>
                </div>

                {error && <div className="pay-error" style={{ marginBottom: "16px" }}>{error}</div>}

                <form className="pay-form" onSubmit={handleSubmit}>
                  <div className="pay-form-group">
                    <label className="pay-label">Cardholder Name</label>
                    <input className="pay-input" type="text" name="cardholderName" placeholder="e.g. Abdullah Ahmed" value={formData.cardholderName} onChange={handleChange} required />
                  </div>

                  <div className="pay-form-group">
                    <label className="pay-label">Card Number</label>
                    <div className="pay-input-wrap">
                      <input className="pay-input" type="text" name="cardNumber" placeholder="0000 0000 0000 0000" value={formData.cardNumber} onChange={handleChange} style={{ paddingRight: "48px" }} required />
                      <span className="pay-input-icon material-symbols-outlined">payment</span>
                    </div>
                  </div>

                  <div className="pay-grid2">
                    <div className="pay-form-group">
                      <label className="pay-label">Expiry Date</label>
                      <input className="pay-input" type="text" name="expiryDate" placeholder="MM / YY" value={formData.expiryDate} onChange={handleChange} required />
                    </div>
                    <div className="pay-form-group">
                      <label className="pay-label">CVV</label>
                      <div className="pay-input-wrap">
                        <input className="pay-input" type="password" name="cvv" placeholder="***" value={formData.cvv} onChange={handleChange} style={{ paddingRight: "48px" }} required />
                        <span className="pay-input-icon material-symbols-outlined" style={{ fontSize: "18px" }}>help_outline</span>
                      </div>
                    </div>
                  </div>

                  <label className="pay-checkbox-row">
                    <input className="pay-checkbox" type="checkbox" name="saveCard" checked={formData.saveCard} onChange={handleChange} />
                    <span className="pay-checkbox-label">Save card for future payments</span>
                  </label>

                  <button className="pay-submit" type="submit" disabled={loading}>
                    {loading ? "Processing..." : `Pay Now — SAR ${total}`}
                  </button>

                  <div className="pay-trust">
                    <span className="material-symbols-outlined" style={{ color: "#325f3f", fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>lock</span>
                    Your payment is 100% secure and encrypted
                  </div>
                </form>
              </div>

              <p style={{ marginTop: "16px", textAlign: "center", fontSize: "12px", color: "#5e5e5b" }}>
                Having trouble? <a href="#" style={{ color: "#325f3f" }}>Contact Support</a>
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="pay-footer">
          <div className="pay-footer-inner">
            <div>
              <div className="pay-footer-logo">Qooti</div>
              <p className="pay-footer-desc">Elevating your lifestyle through precision nutrition and effortless culinary experiences.</p>
            </div>
            <div>
              <div className="pay-footer-title">Product</div>
              <div className="pay-footer-links">
                <a href="#">Meal Plans</a>
                <a href="#">How it Works</a>
                <a href="#">Pricing</a>
              </div>
            </div>
            <div>
              <div className="pay-footer-title">Company</div>
              <div className="pay-footer-links">
                <a href="#">About</a>
                <a href="#">Careers</a>
                <a href="#">Blog</a>
              </div>
            </div>
            <div>
              <div className="pay-footer-title">Support</div>
              <div className="pay-footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">FAQ</a>
              </div>
            </div>
          </div>
          <div className="pay-footer-bottom">© 2025 Qooti. All rights reserved.</div>
        </footer>
      </div>
    </>
  );
}

export default Payment;