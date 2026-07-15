import { useState, useEffect } from "react";
import { authRequest } from "../../services/auth";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingRestaurants, setPendingRestaurants] = useState(0);

  useEffect(() => {
    authRequest("/api/admin/customers")
      .then((data) => setCustomers(data.customers || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    authRequest("/api/admin/overview")
      .then((data) => setPendingRestaurants(data.pending_restaurants))
      .catch(() => {});
  }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .admin-body { background: #fafaf4; font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; display: flex; }

        .admin-sidebar { width: 260px; background: #fff; border-right: 1px solid #e8ebe8; display: flex; flex-direction: column; padding:32px 0; position: fixed; height: 100vh; }
        .admin-logo { font-family: 'Hanken Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: #325f3f; padding: 0 24px 32px;border-bottom: 1px solid #e8ebe8; }
        .admin-nav { display: flex; flex-direction: column; gap: 4px; padding: 24px 12px; flex: 1; }
        .admin-nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 500; color: #414941; cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .admin-nav-item:hover { background: #f4f4ee; color: #325f3f;}
        .admin-nav-item.active { background: #e8f5e9; color: #325f3f; font-weight: 600; }
        .admin-nav-item .material-symbols-outlined { font-size: 20px; }
        .admin-sidebar-footer { padding: 16px 24px; border-top: 1px solid #e8ebe8; font-size: 12px; color: #717971; }
        .pending-badge { background: #fce4ec; color: #c62828; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; margin-left: 8px; }

        .admin-main { margin-left: 260px; flex: 1; padding: 40px 48px; }
        .admin-header { margin-bottom: 32px; }
        .admin-header h1 { font-family: 'Hanken Grotesk', sans-serif; font-size: 28px; font-weight: 700; color: #1a1c19; margin-bottom: 4px; }
        .admin-header p { font-size: 14px; color: #5e5e5b; }

        .section-card { background: #fff; border-radius: 20px; border: 1px solid #e8ebe8; overflow: hidden; }
        .customers-table { width: 100%; border-collapse: collapse; }
        .customers-table th { text-align: left; padding: 14px 24px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #717971; border-bottom: 1px solid #e8ebe8; background: #fafaf4; }
        .customers-table td { padding: 14px 24px; font-size: 14px; color: #1a1c19; border-bottom: 1px solid #f4f4ee; }
        .customers-table tr:last-child td { border-bottom: none; }
        .status-pill { font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; }
        .status-pill.active { background: #e6f4ea; color: #188038; }
        .status-pill.inactive { background: #fdecea; color: #b3261e; }
        .table-empty { padding: 40px; text-align: center; color: #717971; }
        .table-error { padding: 24px; color: #b3261e; }

        .material-symbols-outlined { font-variation-settings: 'FILL'0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; font-family: 'Material Symbols Outlined'; }
      `}</style>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <div className="admin-logo">Qooti Admin</div>
          <nav className="admin-nav">
            <a href="/admin/dashboard" className="admin-nav-item">
              <span className="material-symbols-outlined">dashboard</span>
              Overview
            </a>
            <a href="/admin/pending-restaurants" className="admin-nav-item">
              <span className="material-symbols-outlined">storefront</span>
              Restaurants
              {pendingRestaurants > 0 && (
                <span className="pending-badge">{pendingRestaurants}</span>
              )}
            </a>
            <a href="/admin/customers" className="admin-nav-item active">
              <span className="material-symbols-outlined">group</span>
              Customers
            </a>
            <a href="/admin/orders" className="admin-nav-item">
              <span className="material-symbols-outlined">receipt_long</span>
              Orders
            </a>
          </nav>
          <div className="admin-sidebar-footer">© 2025 Qooti</div>
        </aside>

        <main className="admin-main">
          <div className="admin-header">
            <h1>Customers</h1>
            <p>View all registered customer accounts.</p>
          </div>

          <div className="section-card">
            {loading ? (
              <div className="table-empty">Loading...</div>
            ) : error ? (
              <div className="table-error">{error}</div>
            ) : customers.length === 0 ? (
              <div className="table-empty">No customers registered yet.</div>
            ) : (
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.user_id}>
                      <td>{c.full_name}</td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>{new Date(c.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-pill ${c.is_active ? "active" : "inactive"}`}>
                          {c.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default AdminCustomers;
