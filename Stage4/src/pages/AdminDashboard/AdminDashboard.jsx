import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { authRequest } from "../../services/auth";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalCustomers: 0,
    totalOrders: 0,
    pendingRestaurants: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authRequest("/api/admin/overview")
      .then((data) =>
        setStats({
          totalRestaurants: data.total_restaurants,
          totalCustomers: data.total_customers,
          totalOrders: data.total_orders,
          pendingRestaurants: data.pending_restaurants,
        })
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .admin-body { background: #fafaf4; font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; display: flex; }

        /* Sidebar */
        .admin-sidebar { width: 260px; background: #fff; border-right: 1px solid #e8ebe8; display: flex; flex-direction: column; padding: 32px 0; position: fixed; height: 100vh; }
        .admin-logo { font-family: 'Hanken Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: #325f3f; padding: 0 24px 32px; border-bottom: 1px solid #e8ebe8; }
        .admin-nav { display: flex; flex-direction: column; gap: 4px; padding: 24px 12px; flex: 1; }
        .admin-nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 500; color: #414941; cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .admin-nav-item:hover { background: #f4f4ee; color: #325f3f; }
        .admin-nav-item.active { background: #e8f5e9; color: #325f3f; font-weight: 600; }
        .admin-nav-item .material-symbols-outlined { font-size: 20px; }
        .admin-sidebar-footer { padding: 16px 24px; border-top: 1px solid #e8ebe8; font-size: 12px; color: #717971; }

        /* Main */
        .admin-main { margin-left: 260px; flex: 1; padding: 40px 48px; }

        /* Header */
        .admin-header { margin-bottom: 32px; }
        .admin-header h1 { font-family: 'Hanken Grotesk', sans-serif; font-size: 28px; font-weight: 700; color: #1a1c19; margin-bottom: 4px; }
        .admin-header p { font-size: 14px; color: #5e5e5b; }

        /* Stats Grid */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }
        .stat-card { background: #fff; border-radius: 20px; padding: 24px; border: 1px solid #e8ebe8; display: flex; flex-direction: column; gap: 12px; }
        .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .stat-icon.green { background: #e8f5e9; }
        .stat-icon.blue { background: #e3f2fd; }
        .stat-icon.amber { background: #fff8e1; }
        .stat-icon.red { background: #fce4ec; }
        .stat-icon .material-symbols-outlined { font-size: 22px; }
        .stat-icon.green .material-symbols-outlined { color: #325f3f; }
        .stat-icon.blue .material-symbols-outlined { color: #1565c0; }
        .stat-icon.amber .material-symbols-outlined { color: #f57f17; }
        .stat-icon.red .material-symbols-outlined { color: #c62828; }
        .stat-value { font-family: 'Hanken Grotesk', sans-serif; font-size: 32px; font-weight: 700; color: #1a1c19; }
        .stat-label { font-size: 13px; color: #5e5e5b; font-weight: 500; }

        /* Section */
        .section-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 18px; font-weight: 700; color: #1a1c19; margin-bottom: 16px; }
        .section-card { background: #fff; border-radius: 20px; border: 1px solid #e8ebe8; overflow: hidden; margin-bottom: 24px; }

        /* Quick Actions */
        .quick-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
        .action-card { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #e8ebe8; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .action-card:hover { border-color: #325f3f; box-shadow: 0 4px 12px rgba(50,95,63,0.1); }
        .action-icon { width: 44px; height: 44px; background: #e8f5e9; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .action-icon .material-symbols-outlined { font-size: 22px; color: #325f3f; }
        .action-text h3 { font-size: 14px; font-weight: 600; color: #1a1c19; margin-bottom: 2px; }
        .action-text p { font-size: 12px; color: #5e5e5b; }

        /* Pending badge */
        .pending-badge { background: #fce4ec; color: #c62828; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; margin-left: 8px; }

        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; font-family: 'Material Symbols Outlined'; }
      `}</style>

      <div className="admin-body">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-logo">Qooti Admin</div>
          <nav className="admin-nav">
            <a href="/admin/dashboard" className="admin-nav-item active">
              <span className="material-symbols-outlined">dashboard</span>
              Overview
            </a>
            <a href="/admin/pending-restaurants" className="admin-nav-item">
              <span className="material-symbols-outlined">storefront</span>
              Restaurants
              {stats.pendingRestaurants > 0 && (
                <span className="pending-badge">{stats.pendingRestaurants}</span>
              )}
            </a>
            <a href="/admin/customers" className="admin-nav-item">
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

        {/* Main Content */}
        <main className="admin-main">
          <div className="admin-header">
            <h1>Admin Overview</h1>
            <p>Welcome back — here's what's happening on Qooti today.</p>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon green">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <div className="stat-value">{loading ? "—" : stats.totalRestaurants}</div>
              <div className="stat-label">Total Restaurants</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue">
                <span className="material-symbols-outlined">group</span>
              </div>
              <div className="stat-value">{loading ? "—" : stats.totalCustomers}</div>
              <div className="stat-label">Total Customers</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <div className="stat-value">{loading ? "—" : stats.totalOrders}</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <div className="stat-value">{loading ? "—" : stats.pendingRestaurants}</div>
              <div className="stat-label">Pending Approvals</div>
            </div>
          </div>

          {/* Quick Actions */}
          <p className="section-title">Quick Actions</p>
          <div className="quick-actions">
            <a href="/admin/pending-restaurants" className="action-card">
              <div className="action-icon">
                <span className="material-symbols-outlined">how_to_reg</span>
              </div>
              <div className="action-text">
                <h3>Review Restaurants</h3>
                <p>Approve or reject pending registrations</p>
              </div>
            </a>
            <a href="/admin/customers" className="action-card">
              <div className="action-icon">
                <span className="material-symbols-outlined">manage_accounts</span>
              </div>
              <div className="action-text">
                <h3>Manage Customers</h3>
                <p>View and manage customer accounts</p>
              </div>
            </a>
            <a href="/admin/orders" className="action-card">
              <div className="action-icon">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <div className="action-text">
                <h3>View Orders</h3>
                <p>Monitor all active subscriptions</p>
              </div>
            </a>
          </div>
        </main>
      </div>
    </>
  );
}

export default AdminDashboard;