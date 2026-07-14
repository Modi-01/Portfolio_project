import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { authRequest, isAuthenticated, getCurrentUser } from "../../services/auth";

// Flat weekly plan price (backend ORIGINAL_PRICE on the subscription).
const PLAN_PRICE = 250.0;

// Delivery windows shown to the user; the value is the TIME the backend stores.
const TIME_SLOTS = [
  { value: "08:00", label: "8:00 AM – 10:00 AM" },
  { value: "10:00", label: "10:00 AM – 12:00 PM" },
  { value: "17:00", label: "5:00 PM – 7:00 PM" },
  { value: "19:00", label: "7:00 PM – 9:00 PM" },
];

function OrderSummary() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");

  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  // Set once the subscription + meal selections are created, so a retry after
  // a failed payment attempt reuses them instead of creating duplicates.
  const [createdSub, setCreatedSub] = useState(null);

  // Must arrive here from Weekly Selection with a full week chosen.
  if (!state || !state.days || state.days.length === 0) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <Navbar />
        <main style={{ maxWidth: 600, margin: "0 auto", padding: "64px 32px", textAlign: "center" }}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>No meal selection found</h1>
          <p style={{ color: "#5e5e5b", marginBottom: 24 }}>
            Start by choosing a restaurant and picking your meals for the week.
          </p>
          <Link to="/restaurants" style={{ color: "#325f3f", fontWeight: 600 }}>
            Browse restaurants →
          </Link>
        </main>
      </div>
    );
  }

  const discountAmount = appliedDiscount
    ? Math.round(PLAN_PRICE * Number(appliedDiscount.discount_percentage)) / 100
    : 0;
  const finalPrice = PLAN_PRICE - discountAmount;

  const handleApplyCode = async () => {
    const code = discountInput.trim();
    if (!code) return;
    setDiscountError("");
    setIsApplying(true);
    try {
      const result = await authRequest("/api/discount-codes/validate", "POST", { code });
      setAppliedDiscount(result);
    } catch (err) {
      setAppliedDiscount(null);
      setDiscountError(err.message);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCode = () => {
    setAppliedDiscount(null);
    setDiscountInput("");
    setDiscountError("");
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    const user = getCurrentUser();
    if (user?.user_type !== "client") {
      setError("Only customer accounts can subscribe. Please log in as a customer.");
      return;
    }

    const expiryMatch = expiry.match(/^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/);
    if (!expiryMatch) {
      setError("Expiry date must be in MM/YY format.");
      return;
    }

    setIsPaying(true);
    try {
      let sub = createdSub;

      if (!sub) {
        // 1) Create the subscription (also creates the pending payment row).
        setStep("Creating your subscription…");
        const newSub = await authRequest("/api/subscriptions", "POST", {
          start_date: state.startDate,
          end_date: state.endDate,
          delivery_time: deliveryTime,
          discount_code_id: appliedDiscount?.discount_code_id ?? null,
        });

        // 2) Attach the five daily meal selections.
        setStep("Saving your meal selections…");
        await authRequest("/api/meal-selections", "POST", {
          subscription_id: newSub.subscription_id,
          selections: state.days.map((d) => ({
            meal_id: d.meal_id,
            day_date: d.iso,
            day_of_week: d.full,
          })),
        });

        setCreatedSub(newSub);
        sub = newSub;
      }

      // 3) Start the payment; Moyasar returns a 3-D Secure page to complete.
      setStep("Contacting the payment gateway…");
      const payment = await authRequest("/api/payments", "POST", {
        subscription_id: sub.subscription_id,
        card_number: cardNumber.replace(/\s+/g, ""),
        card_expiry_month: Number(expiryMatch[1]),
        card_expiry_year: 2000 + Number(expiryMatch[2]),
        card_cvc: cvv,
        card_holder_name: cardName,
      });

      if (payment.transaction_url) {
        setStep("Redirecting to secure card verification…");
        window.location.assign(payment.transaction_url);
      } else {
        setError("Payment could not be started. Please try again.");
        setIsPaying(false);
      }
    } catch (err) {
      setError(err.message);
      setIsPaying(false);
      setStep("");
    }
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
        .os-meal-price { font-size: 13px; color: #414941; }
        .os-divider { border: none; border-top: 1px solid #eceee9; margin: 16px 0; }

        .os-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .os-label { font-size: 13px; font-weight: 600; color: #414941; }
        .os-input, .os-select { width: 100%; height: 46px; padding: 0 14px; border-radius: 10px; background: #f4f4ee; border: 2px solid transparent; font-size: 14px; box-sizing: border-box; font-family: inherit; }
        .os-input:focus, .os-select:focus { outline: none; border-color: #325f3f; background: #fff; }

        .os-discount-row { display: flex; gap: 8px; }
        .os-discount-row .os-input { flex: 1; }
        .os-apply-btn { background: #1a1c19; color: #fff; border: none; border-radius: 10px; padding: 0 18px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .os-apply-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .os-discount-error { font-size: 12px; color: #b3261e; margin-top: 4px; }
        .os-discount-success { font-size: 12px; color: #188038; margin-top: 4px; }
        .os-remove-code { background: none; border: none; color: #b3261e; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; margin-left: 8px; }
        .os-sum-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #414941; }
        .os-sum-row.discount { color: #188038; }
        .os-total-row { display: flex; justify-content: space-between; font-family: 'Hanken Grotesk', sans-serif; font-size: 18px; font-weight: 700; margin-top: 8px; }
        .os-note { font-size: 12px; color: #717971; margin-top: 16px; }

        .os-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .os-pay-btn { width: 100%; background: #325f3f; color: #fff; border: none; height: 50px; border-radius: 9999px; font-size: 15px; font-weight: 600; cursor: pointer; }
        .os-pay-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .os-secure-note { font-size: 12px; color: #717971; text-align: center; margin-top: 12px; }
        .os-error { background: #fdecea; color: #b3261e; border-radius: 10px; padding: 12px 14px; font-size: 13px; margin-bottom: 16px; }
        .os-step { font-size: 13px; color: #325f3f; text-align: center; margin-top: 12px; }
      `}</style>

      <div className="os-body">
        <Navbar />

        <main className="os-main">
          <h1 className="os-title">Complete Your Payment</h1>
          <p className="os-secure">
            <span className="os-dot" /> Secure checkout powered by Moyasar — card
            verification via 3-D Secure
          </p>

          <div className="os-grid">
            <div className="os-card">
              <div className="os-card-title">Order Summary</div>

              <div className="os-plan-row">
                <div>
                  <span className="os-address-label">Plan</span>
                  <strong>Weekly Lunch (Sun–Thu)</strong>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="os-address-label">Restaurant</span>
                  <strong>{state.restaurantName}</strong>
                </div>
              </div>

              <div className="os-address-label">Week</div>
              <div className="os-address">
                {state.startDate} → {state.endDate}
              </div>

              <div className="os-field">
                <label className="os-label">Delivery Time</label>
                <select
                  className="os-select"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  required
                >
                  <option value="">Select a delivery window</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="os-field">
                <label className="os-label">Discount Code</label>
                {appliedDiscount ? (
                  <p className="os-discount-success">
                    Code "{appliedDiscount.code}" applied —{" "}
                    {Number(appliedDiscount.discount_percentage)}% off!
                    {!createdSub && (
                      <button type="button" className="os-remove-code" onClick={handleRemoveCode}>
                        Remove
                      </button>
                    )}
                  </p>
                ) : createdSub ? (
                  <p className="os-note" style={{ marginTop: 0 }}>
                    Order already created — the discount can no longer be changed for this attempt.
                  </p>
                ) : (
                  <>
                    <div className="os-discount-row">
                      <input
                        className="os-input"
                        type="text"
                        placeholder="e.g. SAVE10"
                        value={discountInput}
                        onChange={(e) => setDiscountInput(e.target.value)}
                      />
                      <button
                        type="button"
                        className="os-apply-btn"
                        onClick={handleApplyCode}
                        disabled={isApplying || !discountInput.trim()}
                      >
                        {isApplying ? "Checking…" : "Apply"}
                      </button>
                    </div>
                    {discountError && <p className="os-discount-error">{discountError}</p>}
                  </>
                )}
              </div>

              <div className="os-meals-title">Selected Meals</div>
              {state.days.map((d) => (
                <div className="os-meal-row" key={d.iso}>
                  <div>
                    <div className="os-meal-name">{d.name}</div>
                    <div className="os-meal-restaurant">{d.full}, {d.iso}</div>
                  </div>
                  <span className="os-meal-price">{d.calories} kcal</span>
                </div>
              ))}

              <hr className="os-divider" />

              <div className="os-sum-row">
                <span>Weekly Plan (5 meals)</span>
                <span>SAR {PLAN_PRICE.toFixed(2)}</span>
              </div>
              {appliedDiscount && (
                <div className="os-sum-row discount">
                  <span>Discount ({appliedDiscount.code})</span>
                  <span>− SAR {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="os-sum-row">
                <span>Delivery Fee</span>
                <span>FREE</span>
              </div>
              <div className="os-total-row">
                <span>Final Price</span>
                <span>SAR {finalPrice.toFixed(2)}</span>
              </div>

              <p className="os-note">
                Meals are delivered to your saved address at the selected time,
                Sunday to Thursday.
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
                    inputMode="numeric"
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
                      type="password"
                      inputMode="numeric"
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && <div className="os-error">{error}</div>}

                {!deliveryTime && (
                  <p className="os-error" style={{ background: "transparent", padding: 0 }}>
                    Please select a delivery time before paying.
                  </p>
                )}

                <button
                  className="os-pay-btn"
                  type="submit"
                  disabled={isPaying || !deliveryTime}
                >
                  {isPaying ? "Processing…" : `Pay Now — SAR ${finalPrice.toFixed(2)}`}
                </button>

                {step && <p className="os-step">{step}</p>}
                <p className="os-secure-note">
                  🔒 After paying you'll be taken to your bank's 3-D Secure page
                  to verify the card.
                </p>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default OrderSummary;
