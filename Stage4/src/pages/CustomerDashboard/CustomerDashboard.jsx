import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { useAuth } from "../../context/AuthContext";
import { authRequest } from "../../services/auth";

// TODO: replace with real order-item data once a "GET /api/subscriptions/:id/schedule"
// endpoint exists. For now this shows a sample schedule for display purposes.
const SAMPLE_SCHEDULE = [
  { day: "Sunday", meal: "Miso-Glazed Atlantic Salmon" },
  { day: "Monday", meal: "Golden Harvest Buddha Bowl" },
  { day: "Tuesday", meal: "Grass-Fed Sirloin & Asparagus" },
  { day: "Wednesday", meal: "Provencal Herb Chicken" },
  { day: "Thursday", meal: "Silken Tofu & Avocado" },
];

const STATUS_COLORS = {
  confirmed: { bg: "#e6f4ea", color: "#188038" },
  pending: { bg: "#fff4e5", color: "#b06000" },
  cancelled: { bg: "#fdecea", color: "#b3261e" },
};

function CustomerDashboard() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchSubscriptions = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await authRequest(`/api/subscriptions/${user.user_id}`);
        setSubscriptions(data.subscriptions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user]);

  const activeSubscription = subscriptions[0];

  return (
    <>
      <style>{`
        .cd-body { background: #fafaf4; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; color: #1a1c19; }
        .cd-main { max-width: 900px; margin: 0 auto; padding: 40px 32px 64px; }
        .cd-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 28px; font-weight: 700; margin-bottom: 24px; }
        .cd-card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(26,28,25,0.04); margin-bottom: 24px; }
        .cd-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .cd-card-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 18px; font-weight: 700; }
        .cd-status-badge { font-size: 12px; font-weight: 700; padding: 5px 14px; border-radius: 9999px; text-transform: capitalize; }
        .cd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .cd-field-label { font-size: 11px; color: #717971; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .cd-field-value { font-size: 15px; font-weight: 600; }
        .cd-divider { border: none; border-top: 1px solid #eceee9; margin: 20px 0; }
        .cd-price-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #414941; }
        .cd-price-row.final { font-family: 'Hanken Grotesk', sans-serif; font-size: 16px; font-weight: 700; color: #1a1c19; }
        .cd-schedule-table { width: 100%; border-collapse: collapse; }
        .cd-schedule-table th { text-align: left; padding: 10px 12px; font-size: 12px; font-weight: 600; color: #717971; border-bottom: 1px solid #eceee9; }
        .cd-schedule-table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f4f4ee; }
        .cd-empty { background: #fff; border: 2px dashed #c1c9bf; border-radius: 16px; padding: 40px; text-align: center; color: #717971; }
        .cd-error { color: #b3261e; font-size: 14px; margin-bottom: 16px; }
        .cd-sample-note { font-size: 12px; color: #717971; margin-top: 12px; }
      `}</style>

      <div className="cd-body">
        <Navbar />

        <main className="cd-main">
          <h1 className="cd-title">My Dashboard</h1>

          {error && <p className="cd-error">{error}</p>}

          {loading ? (
            <p>Loading...</p>
          ) : !activeSubscription ? (
            <div className="cd-empty">
              You don't have an active subscription yet. Head to Meal Plans to get started.
            </div>
          ) : (
            <>
              <div className="cd-card">
                <div className="cd-card-header">
                  <span className="cd-card-title">Active Subscription</span>
                  <span
                    className="cd-status-badge"
                    style={{
                      background: STATUS_COLORS[activeSubscription.status]?.bg || "#f4f4ee",
                      color: STATUS_COLORS[activeSubscription.status]?.color || "#414941",
                    }}
                  >
                    {activeSubscription.status}
                  </span>
                </div>

                <div className="cd-grid">
                  <div>
                    <div className="cd-field-label">Start Date</div>
                    <div className="cd-field-value">{activeSubscription.start_date}</div>
                  </div>
                  <div>
                    <div className="cd-field-label">End Date</div>
                    <div className="cd-field-value">{activeSubscription.end_date}</div>
                  </div>
                  <div>
                    <div className="cd-field-label">Delivery Time</div>
                    <div className="cd-field-value">{activeSubscription.delivery_time}</div>
                  </div>
                  <div>
                    <div className="cd-field-label">Payment Status</div>
                    <div className="cd-field-value" style={{ textTransform: "capitalize" }}>
                      {activeSubscription.payment_status || "—"}
                    </div>
                  </div>
                </div>

                <hr className="cd-divider" />

                <div className="cd-price-row">
                  <span>Original Price</span>
                  <span>SAR {activeSubscription.original_price}</span>
                </div>
                <div className="cd-price-row">
                  <span>Discount</span>
                  <span>− SAR {activeSubscription.discount_amount}</span>
                </div>
                <div className="cd-price-row final">
                  <span>Final Price</span>
                  <span>SAR {activeSubscription.final_price}</span>
                </div>
              </div>

              <div className="cd-card">
                <div className="cd-card-header">
                  <span className="cd-card-title">Weekly Schedule</span>
                </div>

                <table className="cd-schedule-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Meal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_SCHEDULE.map((row) => (
                      <tr key={row.day}>
                        <td>{row.day}</td>
                        <td>{row.meal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="cd-sample-note">
                  Sample schedule shown — real meal selections will appear here once available.
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default CustomerDashboard;
