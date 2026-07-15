import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { authRequest } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";

function Profile() {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    authRequest("/api/users/me")
      .then((data) =>
        setFormData({
          full_name: data.user.full_name || "",
          phone: data.user.phone || "",
          age: data.user.age ?? "",
          gender: data.user.gender || "",
          height_cm: data.user.height_cm ?? "",
          weight_kg: data.user.weight_kg ?? "",
          health_goal: data.user.health_goal || "",
          address: data.user.address || "",
        })
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const data = await authRequest("/api/users/me", "PUT", {
        full_name: formData.full_name,
        phone: formData.phone,
        age: Number(formData.age),
        gender: formData.gender,
        height_cm: Number(formData.height_cm),
        weight_kg: Number(formData.weight_kg),
        health_goal: formData.health_goal,
        address: formData.address,
      });
      login(localStorage.getItem("token"), { ...user, full_name: data.user.full_name });
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      <style>{`
        .pf-body { background: #fafaf4; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; color: #1a1c19; }
        .pf-main { max-width: 640px; margin: 0 auto; padding: 40px 32px 64px; }
        .pf-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 28px; font-weight: 700; margin-bottom: 4px; }
        .pf-subtitle { font-size: 14px; color: #5e5e5b; margin-bottom: 24px; }
        .pf-card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(26,28,25,0.04); }
        .pf-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .pf-label { font-size: 13px; font-weight: 600; color: #414941; }
        .pf-input, .pf-select { width: 100%; padding: 12px 14px; border-radius: 10px; background: #f4f4ee; border: 2px solid transparent; font-size: 14px; box-sizing: border-box; font-family: inherit; }
        .pf-input:focus, .pf-select:focus { outline: none; border-color: #325f3f; background: #fff; }
        .pf-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .pf-error { color: #b3261e; font-size: 14px; margin-bottom: 16px; }
        .pf-success { color: #188038; font-size: 14px; margin-bottom: 16px; }
        .pf-submit-btn { background: #325f3f; color: #fff; border: none; height: 48px; border-radius: 9999px; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 8px; }
        .pf-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .pf-email-note { font-size: 12px; color: #717971; margin-top: -8px; margin-bottom: 16px; }
      `}</style>

      <div className="pf-body">
        <Navbar />

        <main className="pf-main">
          <h1 className="pf-title">My Profile</h1>
          <p className="pf-subtitle">Update your personal details and health information.</p>

          <div className="pf-card">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="pf-field">
                  <label className="pf-label">Email</label>
                  <input className="pf-input" value={user?.email || ""} disabled />
                </div>
                <p className="pf-email-note">Email can't be changed here.</p>

                <div className="pf-field">
                  <label className="pf-label">Full Name</label>
                  <input className="pf-input" name="full_name" value={formData.full_name} onChange={handleChange} required />
                </div>

                <div className="pf-field">
                  <label className="pf-label">Phone</label>
                  <input className="pf-input" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>

                <div className="pf-field">
                  <label className="pf-label">Address</label>
                  <input className="pf-input" name="address" value={formData.address} onChange={handleChange} required />
                </div>

                <div className="pf-field">
                  <label className="pf-label">Nutrition Info</label>
                  <div className="pf-row3">
                    <input className="pf-input" type="text" inputMode="numeric" pattern="[0-9]*" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
                    <input className="pf-input" type="text" inputMode="numeric" pattern="[0-9]*" name="height_cm" placeholder="Height (cm)" value={formData.height_cm} onChange={handleChange} required />
                    <input className="pf-input" type="text" inputMode="numeric" pattern="[0-9]*" name="weight_kg" placeholder="Weight (kg)" value={formData.weight_kg} onChange={handleChange} required />
                  </div>
                </div>

                <div className="pf-field">
                  <label className="pf-label">Gender</label>
                  <select className="pf-select" name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="pf-field">
                  <label className="pf-label">Health Goal</label>
                  <select className="pf-select" name="health_goal" value={formData.health_goal} onChange={handleChange} required>
                    <option value="">Choose your primary focus</option>
                    <option value="lose_weight">Lose Weight</option>
                    <option value="maintain">Maintain Healthy Weight</option>
                    <option value="bulking">Bulking</option>
                    <option value="gaining_weight">Gaining Weight</option>
                  </select>
                </div>

                {error && <p className="pf-error">{error}</p>}
                {success && <p className="pf-success">{success}</p>}

                <button className="pf-submit-btn" type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default Profile;
