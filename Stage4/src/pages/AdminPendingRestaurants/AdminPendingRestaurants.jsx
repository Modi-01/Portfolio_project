import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authRequest } from "../../services/auth";

function AdminPendingRestaurants() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchPending = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await authRequest("/api/admin/restaurants/pending");
      setRestaurants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_type === "admin") {
      fetchPending();
    }
  }, [user]);

  const handleApprove = async (id) => {
    setActionError("");
    try {
      await authRequest(`/api/admin/restaurants/${id}/status`, "PATCH", {
        status: "approved",
      });
      setRestaurants((prev) => prev.filter((r) => r.restaurant_id !== id));
    } catch (err) {
      setActionError(err.message);
    }
  };

  const openRejectModal = (id) => {
    setRejectingId(id);
    setRejectionReason("");
    setActionError("");
  };

  const closeRejectModal = () => {
    setRejectingId(null);
    setRejectionReason("");
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      setActionError("Rejection reason is required.");
      return;
    }
    try {
      await authRequest(`/api/admin/restaurants/${rejectingId}/status`, "PATCH", {
        status: "rejected",
        rejection_reason: rejectionReason,
      });
      setRestaurants((prev) => prev.filter((r) => r.restaurant_id !== rejectingId));
      closeRejectModal();
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (!user) {
    return <div style={{ padding: 48 }}>Please log in.</div>;
  }

  if (user.user_type !== "admin") {
    return <div style={{ padding: 48 }}>Access denied. Admins only.</div>;
  }

  return (
    <>
      <style>{`
        .apr-body { background: #fafaf4; min-height: 100vh; padding: 48px 64px; font-family: 'Plus Jakarta Sans', sans-serif; color: #1a1c19; }
        .apr-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 28px; font-weight: 700; margin-bottom: 24px; }
        .apr-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(26,28,25,0.04); }
        .apr-table th { background: #f4f4ee; text-align: left; padding: 14px 16px; font-size: 13px; font-weight: 600; color: #414941; }
        .apr-table td { padding: 14px 16px; border-top: 1px solid #eceee9; font-size: 14px; vertical-align: top; }
        .apr-btn { border: none; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; margin-right: 8px; }
        .apr-approve { background: #325f3f; color: #fff; }
        .apr-approve:hover { background: #4a7856; }
        .apr-reject { background: #fdecea; color: #b3261e; }
        .apr-reject:hover { background: #f8d7da; }
        .apr-error { color: #b3261e; font-size: 14px; margin-bottom: 16px; }
        .apr-empty { color: #717971; font-size: 14px; padding: 24px; text-align: center; }
        .apr-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .apr-modal { background: #fff; border-radius: 16px; padding: 32px; width: 100%; max-width: 420px; }
        .apr-modal h3 { font-family: 'Hanken Grotesk', sans-serif; font-size: 20px; margin-bottom: 12px; }
        .apr-modal textarea { width: 100%; min-height: 100px; padding: 12px; border-radius: 10px; background: #f4f4ee; border: 2px solid transparent; font-size: 14px; box-sizing: border-box; font-family: inherit; resize: vertical; }
        .apr-modal textarea:focus { outline: none; border-color: #325f3f; background: #fff; }
        .apr-modal-actions { display: flex; gap: 12px; margin-top: 16px; justify-content: flex-end; }
        .apr-cancel-btn { background: #f4f4ee; color: #414941; border: none; border-radius: 8px; padding: 10px 18px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .apr-confirm-btn { background: #b3261e; color: #fff; border: none; border-radius: 8px; padding: 10px 18px; font-size: 14px; font-weight: 600; cursor: pointer; }
      `}</style>

      <div className="apr-body">
        <h1 className="apr-title">Pending Restaurants</h1>

        {actionError && <p className="apr-error">{actionError}</p>}
        {error && <p className="apr-error">{error}</p>}

        {loading ? (
          <p>Loading...</p>
        ) : restaurants.length === 0 ? (
          <div className="apr-empty">No restaurants awaiting approval.</div>
        ) : (
          <table className="apr-table">
            <thead>
              <tr>
                <th>Restaurant Name</th>
                <th>Description</th>
                <th>Registered On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <tr key={r.restaurant_id}>
                  <td>{r.restaurant_name}</td>
                  <td>{r.description || "—"}</td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="apr-btn apr-approve" onClick={() => handleApprove(r.restaurant_id)}>
                      Approve
                    </button>
                    <button className="apr-btn apr-reject" onClick={() => openRejectModal(r.restaurant_id)}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {rejectingId && (
          <div className="apr-modal-overlay">
            <div className="apr-modal">
              <h3>Reason for rejection</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this restaurant is being rejected..."
              />
              {actionError && <p className="apr-error">{actionError}</p>}
              <div className="apr-modal-actions">
                <button className="apr-cancel-btn" onClick={closeRejectModal}>Cancel</button>
                <button className="apr-confirm-btn" onClick={confirmReject}>Confirm Reject</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminPendingRestaurants;
