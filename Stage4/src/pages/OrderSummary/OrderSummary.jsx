import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";

const SELECTED_MEALS = [
  { name: "Zesty Salmon & Asparagus", restaurant: "Green Fork Bistro", price: 45 },
  { name: "Truffle Forest Grains", restaurant: "Green Fork Bistro", price: 42 },
  { name: "Nordic Wild Salmon", restaurant: "The Ocean's Harvest", price: 48 },
];

function OrderSummary() {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const subtotal = SELECTED_MEALS.reduce((sum, m) => sum + m.price, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const handlePay = (e) => {
    e.preventDefault();
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setPaid(true);
    }, 1200);
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .os-body { background: #fafaf4; color: #1a1c19; font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; }
        .os-main { max-width: 1000px; margin: 0 auto; padding: 40px 32px 64px; }
        .os-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 28px; font-weight: 700; margin-bottom: 4px; }
        .os-secure { font-size: 13px; color: #325f3f; margin-bottom: 24px; display: flex; align-items: center; gap: 6px; }
        .os-dot { width: 8px; height: 8px; border-radius: 50%; background: #325f3f; }
        .os-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
        .os-card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(26,28,25,0.04); }
        .os-card-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 16px; }
        .os-plan-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 12px; }
        .os-plan-row strong { display: block; font-size: 15px; }
        .os-address-label { font-size: 11px; color: #717971; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .os-address { font-size: 14px; margin-bottom: 16px; }
        .os-meals-title { font-size: 13px; font-weight: 600; color: #414941; margin-bottom: 10px; }
        .os-meal-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .os-meal-name { font-size: 14px; font-weight: 600; }
        .os-meal-restaurant { font-size: 12px; color: #717971; }
        .os-meal-price { font-size: 14px; font-weight: 600; }
        .os-divider { border: none; border-top: 1px solid #eceee9; margin: 16px 0; }
        .os-sum-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #414941; }
        .os-total-row { display: flex; justify-content: space-between; font-family: 'Hanken Grotesk', sans-serif; font-size: 18px; font-weight: 700; margin-top: 8px; }
        .os-note { font-size: 12px; color: #717971; margin-top: 16px; }

        .os-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .os-label { font-size: 13px; font-weight: 600; color: #414941; }
        .os-input { width: 100%; height: 46px; padding: 0 14px; border-radius: 10px; background: #f4f4ee; border: 2px solid transparent; font-size: 14px; box-sizing: border-box; font-family: inherit; }
        .os-input:focus { outline: none; border-color: #325f3f; background: #fff; }
        .os-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .os-checkbox-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #414941; margin-bottom: 16px; }
        .os-pay-btn { width: 100%; background: #325f3f; color: #fff; border: none; height: 50px; border-radius: 9999px; font-size: 15px; font-weight: 600; cursor: pointer; }
        .os-pay-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .os-secure-note { font-size: 12px; color: #717971; text-align: center; margin-top: 12px; }
        .os-support { font-size: 12px; color: #717971; text-align: center; margin-top: 8px; }
        .os-support a { color: #325f3f; font-weight: 600; text-decoration: none; }

        .os-success { text-align: center; padding: 64px 24px; }
        .os-success-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 26px; font-weight: 700; margin-bottom: 8px; }
        .os-success-desc { font-size: 14px; color: #5e5e5b; }
      `}</style>

      <div className="os-body">
        <Navbar />

        <main className="os-main">
          {paid ? (
            <div className="os-success">
              <div className="os-success-title">✅ Payment Successful</div>
              <p className="os-success-desc">
                Your weekly meal subscription is confirmed. Total charged: SAR {total}
              </p>
            </div>
          ) : (
            <>
              <h1 className="os-title">Complete Your Payment</h1>
              <p className="os-secure">
                <span className="os-dot" /> Secure checkout powered by Stripe
              </p>

              <div className="os-grid">
                <div className="os-card">
                  <div className="os-card-title">Order Summary</div>

                  <div className="os-plan-row">
                    <div>
                      <span className="os-address-label">Plan Type</span>
                      <strong>Essentials Monthly</strong>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="os-address-label">Meals</span>
                      <strong>10 meals/week</strong>
                    </div>
                  </div>

                  <div className="os-address-label">Delivery Address</div>
                  <div className="os-address">123 Wellness Way, San Francisco, CA</div>

                  <div className="os-meals-title">Selected Meals</div>
                  {SELECTED_MEALS.map((meal) => (
                    <div className="os-meal-row" key={meal.name}>
                      <div>
                        <div className="os-meal-name">{meal.name}</div>
                        <div className="os-meal-restaurant">{meal.restaurant}</div>
                      </div>
                      <span className="os-meal-price">SAR {meal.price}</span>
                    </div>
                  ))}

                  <hr className="os-divider" />

                  <div className="os-sum-row">
                    <span>Subtotal</span>
                    <span>SAR {subtotal}</span>
                  </div>
                  <div className="os-sum-row">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? "FREE" : `SAR ${deliveryFee}`}</span>
                  </div>
                  <div className="os-total-row">
                    <span>Total</span>
                    <span>SAR {total}</span>
                  </div>

                  <p className="os-note">
                    Subscription renews automatically every Friday. You can skip or cancel any week before Thursday 11:59 PM.
                  </p>
                </div>

                <div className="os-card">
                  <div className="os-card-title">Payment Details</div>

                  <form onSubmit={handlePay}>
                    <div className="os-field">
                      <label className="os-label">Cardholder Name</label>
                      <input
                        className="os-input"
                        type="text"
                        placeholder="e.g. Abdullah Ahmed"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="os-field">
                      <label className="os-label">Card Number</label>
                      <input
                        className="os-input"
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="os-row2">
                      <div className="os-field">
                        <label className="os-label">Expiry Date</label>
                        <input
                          className="os-input"
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          required
                        />
                      </div>
                      <div className="os-field">
                        <label className="os-label">CVV</label>
                        <input
                          className="os-input"
                          type="text"
                          placeholder="•••"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <label className="os-checkbox-row">
                      <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />
                      Save card for future payments
                    </label>

                    <button className="os-pay-btn" type="submit" disabled={isPaying}>
                      {isPaying ? "Processing..." : `Pay Now — SAR ${total}`}
                    </button>

                    <p className="os-secure-note">🔒 Your payment is 100% secure and encrypted</p>
                    <p className="os-support">
                      Having trouble? <a href="#">Contact Support</a>
                    </p>
                  </form>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default OrderSummary;
