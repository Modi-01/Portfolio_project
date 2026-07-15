import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authRequest } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

function RestaurantOrders() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeDay, setActiveDay] = useState("Sunday");
  const [ordersByDay, setOrdersByDay] = useState({});
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    authRequest("/api/restaurants/me")
      .then((data) => setRestaurantId(data.restaurant.restaurant_id))
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!restaurantId) return;

    setLoading(true);
    setError("");
    Promise.all(
      DAYS.map((day) =>
        authRequest(`/api/restaurants/${restaurantId}/orders?day=${day}`)
          .then((data) => [day, data.orders || []])
          .catch(() => [day, []])
      )
    )
      .then((results) => {
        const map = {};
        results.forEach(([day, orders]) => { map[day] = orders; });
        setOrdersByDay(map);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activeOrders = ordersByDay[activeDay] || [];
  const filteredOrders = activeOrders.filter((o) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return o.client_name.toLowerCase().includes(q) || o.meal_name.toLowerCase().includes(q);
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }
        .ro-body { background: #fafaf4; font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; display: flex; color: #1a1c19; }

        .ro-sidebar { width: 240px; background: #fff; border-right: 1px solid #e8ebe8; display: flex; flex-direction: column; padding: 24px 0; position: fixed; height: 100vh; }
        .ro-logo { font-family: 'Hanken Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: #325f3f; padding: 0 20px 20px; border-bottom: 1px solid #e8ebe8; }
        .ro-logo small { display: block; font-size: 11px; font-weight: 500; color: #717971; margin-top: 2px; }
        .ro-nav { display: flex; flex-direction: column; gap: 4px; padding: 16px 10px; flex: 1; }
        .ro-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; font-size: 14px; font-weight: 500; color: #414941; text-decoration: none; }
        .ro-nav-item:hover { background: #f4f4ee; color: #325f3f; }
        .ro-nav-item.active { background: #e8f5e9; color: #325f3f; font-weight: 600; }
        .ro-add-btn { margin: 8px 10px; background: #325f3f; color: #fff; border: none; border-radius: 9999px; padding: 10px 16px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; text-align: center; }
        .ro-sidebar-footer { padding: 12px 20px; border-top: 1px solid #e8ebe8; }
        .ro-logout-btn { background: none; border: none; color: #b3261e; font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; }

        .ro-main { margin-left: 240px; flex: 1; padding: 32px 40px; }
        .ro-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .ro-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 26px; font-weight: 700; margin-bottom: 4px; }
        .ro-subtitle { font-size: 14px; color: #5e5e5b; }
        .ro-user { font-size: 13px; color: #414941; font-weight: 600; }

        .ro-day-tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
        .ro-day-tab { background: #fff; border: 2px solid #e8ebe8; border-radius: 9999px; padding: 10px 20px; font-size: 14px; font-weight: 600; color: #414941; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .ro-day-tab:hover { border-color: #325f3f; }
        .ro-day-tab.active { background: #325f3f; border-color: #325f3f; color: #fff; }
        .ro-day-count { font-size: 11px; opacity: 0.8; }

        .ro-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
        .ro-section-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 18px; font-weight: 700; }
        .ro-search { padding: 10px 16px; border-radius: 9999px; background: #fff; border: 1px solid #e8ebe8; font-size: 14px; width: 240px; font-family: inherit; }
        .ro-search:focus { outline: none; border-color: #325f3f; }

        .ro-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(26,28,25,0.04); }
        .ro-table th { background: #f4f4ee; text-align: left; padding: 14px 16px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #717971; }
        .ro-table td { padding: 14px 16px; border-top: 1px solid #eceee9; font-size: 14px; }
        .ro-status-pill { font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; background: #e6f4ea; color: #188038; text-transform: capitalize; }
        .ro-error { color: #b3261e; font-size: 14px; margin-bottom: 16px; }
        .ro-empty { background: #fff; border: 2px dashed #c1c9bf; border-radius: 16px; padding: 40px; text-align: center; color: #717971; }
        .material-symbols-outlined { font-variation-settings: 'FILL'0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; font-family: 'Material Symbols Outlined'; }
      `}</style>

      <div className="ro-body">
        <aside className="ro-sidebar">
          <div className="ro-logo">
            Qooti
            <small>Partner Portal</small>
          </div>
          <nav className="ro-nav">
            <Link to="/restaurant/meals" className="ro-nav-item">
              <span className="material-symbols-outlined">restaurant_menu</span>
              My Meals
            </Link>
            <Link to="/restaurant/orders" className="ro-nav-item active">
              <span className="material-symbols-outlined">receipt_long</span>
              Orders
            </Link>
          </nav>
          <Link to="/restaurant/meals/new" className="ro-add-btn">+ Add New Meal</Link>
          <div className="ro-sidebar-footer">
            <button className="ro-logout-btn" onClick={handleLogout}>Log Out</button>
          </div>
        </aside>

        <main className="ro-main">
          <div className="ro-header">
            <div>
              <h1 className="ro-title">Daily Order Fulfillment</h1>
              <p className="ro-subtitle">Manage and track your incoming kitchen requests.</p>
            </div>
            {user && <span className="ro-user">{user.full_name}</span>}
          </div>

          <div className="ro-day-tabs">
            {DAYS.map((day) => (
              <button
                key={day}
                className={`ro-day-tab ${activeDay === day ? "active" : ""}`}
                onClick={() => setActiveDay(day)}
              >
                {day}
                <span className="ro-day-count">{(ordersByDay[day] || []).length}</span>
              </button>
            ))}
          </div>

          {error && <p className="ro-error">{error}</p>}

          <div className="ro-section-header">
            <span className="ro-section-title">{activeDay}'s Queue</span>
            <input
              className="ro-search"
              type="text"
              placeholder="Search customer or meal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : filteredOrders.length === 0 ? (
            <div className="ro-empty">
              {activeOrders.length === 0
                ? `No confirmed orders for ${activeDay} yet.`
                : "No orders match your search."}
            </div>
          ) : (
            <table className="ro-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Meal</th>
                  <th>Delivery Address</th>
                  <th>Delivery Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.order_item_id}>
                    <td>{o.client_name}</td>
                    <td>{o.meal_name}</td>
                    <td>{o.delivery_address}</td>
                    <td>{o.delivery_time}</td>
                    <td>
                      <span className="ro-status-pill">{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </>
  );
}

export default RestaurantOrders;
