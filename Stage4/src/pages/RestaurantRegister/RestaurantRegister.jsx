import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/auth";

function RestaurantRegister() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: "",
    ownerFullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    description: "",
    agreed: false,
  });
  const [logoFile, setLogoFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleLogoChange = (e) => {
    setLogoFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!formData.agreed) {
      setError("You must agree to the Partner Agreement and Privacy Policy.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({
        user_type: "restaurant",
        full_name: formData.ownerFullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        restaurant_name: formData.restaurantName,
        description: formData.description,
      });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .pr-body { background: #fafaf4; color: #1a1c19; font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; }
        .pr-main { display: flex; min-height: 100vh; }
        .pr-left { position: relative; width: 40%; background: #325f3f; display: flex; flex-direction: column; justify-content: center; padding: 0 64px; color: #fff; }
        .pr-logo-top { position: absolute; top: 48px; left: 64px; font-family: 'Hanken Grotesk', sans-serif; font-size: 24px; font-weight: 700; }
        .pr-left-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 40px; font-weight: 700; line-height: 1.2; }
        .pr-left-desc { font-size: 16px; opacity: 0.85; margin-top: 16px; max-width: 380px; }
        .pr-stats { display: flex; gap: 40px; margin-top: 40px; }
        .pr-stat-num { font-size: 28px; font-weight: 700; }
        .pr-stat-label { font-size: 12px; text-transform: uppercase; opacity: 0.8; letter-spacing: 0.05em; }
        .pr-right { width: 60%; display: flex; align-items: center; justify-content: center; padding: 48px; }
        .pr-card { width: 100%; max-width: 480px; }
        .pr-card-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 28px; font-weight: 600; }
        .pr-card-sub { font-size: 14px; color: #5e5e5b; margin-top: 4px; margin-bottom: 24px; }
        .pr-form { display: flex; flex-direction: column; gap: 16px; }
        .pr-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .pr-field { display: flex; flex-direction: column; gap: 6px; }
        .pr-label { font-size: 13px; font-weight: 600; color: #414941; }
        .pr-input, .pr-textarea { width: 100%; padding: 12px 16px; border-radius: 10px; background: #f4f4ee; border: 2px solid transparent; font-size: 15px; box-sizing: border-box; font-family: inherit; }
        .pr-input:focus, .pr-textarea:focus { outline: none; border-color: #325f3f; background: #fff; }
        .pr-textarea { resize: vertical; min-height: 80px; }
        .pr-dropzone { border: 2px dashed #c1c9bf; border-radius: 10px; padding: 20px; text-align: center; font-size: 13px; color: #717971; cursor: pointer; }
        .pr-checkbox-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #414941; }
        .pr-error { font-size: 13px; color: #b3261e; }
        .pr-submit { width: 100%; background: #325f3f; color: #fff; height: 52px; border-radius: 9999px; border: none; font-size: 16px; font-weight: 600; cursor: pointer; }
        .pr-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .pr-footer-link { text-align: center; font-size: 14px; margin-top: 20px; }
        .pr-footer-link a { color: #325f3f; font-weight: 600; text-decoration: none; }
      `}</style>

      <div className="pr-body">
        <main className="pr-main">
          <section className="pr-left">
            <div className="pr-logo-top">Qooti</div>
            <h1 className="pr-left-title">Join our network of healthy restaurants</h1>
            <p className="pr-left-desc">
              Partner with Qooti to reach thousands of health-conscious
              professionals seeking premium, nutritious meals delivered with care.
            </p>
            <div className="pr-stats">
              <div>
                <div className="pr-stat-num">500+</div>
                <div className="pr-stat-label">Active Partners</div>
              </div>
              <div>
                <div className="pr-stat-num">15k+</div>
                <div className="pr-stat-label">Monthly Users</div>
              </div>
            </div>
          </section>

          <section className="pr-right">
            <div className="pr-card">
              <h2 className="pr-card-title">Partner Registration</h2>
              <p className="pr-card-sub">Fill in your details to start your journey with us.</p>

              <form className="pr-form" onSubmit={handleSubmit}>
                <div className="pr-grid2">
                  <div className="pr-field">
                    <label className="pr-label">Restaurant Name</label>
                    <input className="pr-input" type="text" name="restaurantName" placeholder="e.g. Green Leaf Cafe" value={formData.restaurantName} onChange={handleChange} required />
                  </div>
                  <div className="pr-field">
                    <label className="pr-label">Owner Full Name</label>
                    <input className="pr-input" type="text" name="ownerFullName" placeholder="John Doe" value={formData.ownerFullName} onChange={handleChange} required />
                  </div>
                </div>

                <div className="pr-grid2">
                  <div className="pr-field">
                    <label className="pr-label">Email</label>
                    <input className="pr-input" type="email" name="email" placeholder="owner@restaurant.com" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="pr-field">
                    <label className="pr-label">Phone Number</label>
                    <input className="pr-input" type="tel" name="phone" placeholder="+966 54321 0987" value={formData.phone} onChange={handleChange} required />
                  </div>
                </div>

                <div className="pr-grid2">
                  <div className="pr-field">
                    <label className="pr-label">Password</label>
                    <input className="pr-input" type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                  </div>
                  <div className="pr-field">
                    <label className="pr-label">Confirm Password</label>
                    <input className="pr-input" type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
                  </div>
                </div>

                <div className="pr-field">
                  <label className="pr-label">Restaurant Description</label>
                  <textarea className="pr-textarea" name="description" placeholder="Tell us about your culinary philosophy and specialties..." value={formData.description} onChange={handleChange} />
                </div>

                <div className="pr-field">
                  <label className="pr-label">Logo Upload</label>
                  <label className="pr-dropzone">
                    {logoFile ? logoFile.name : "Drag and drop or click to browse — PNG, JPG up to 5MB"}
                    <input type="file" accept="image/png,image/jpeg" onChange={handleLogoChange} hidden />
                  </label>
                </div>

                <label className="pr-checkbox-row">
                  <input type="checkbox" name="agreed" checked={formData.agreed} onChange={handleChange} />
                  I agree to the Partner Agreement and Privacy Policy.
                </label>

                {error && <p className="pr-error">{error}</p>}

                <button className="pr-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Registering..." : "Register as Partner"}
                </button>
              </form>

              <p className="pr-footer-link">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default RestaurantRegister;