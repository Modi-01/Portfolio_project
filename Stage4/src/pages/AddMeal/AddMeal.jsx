import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authRequest } from "../../services/auth";

function AddMeal() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ingredients: "",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fats_g: "",
    image_url: "",
    tags: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { restaurant } = await authRequest("/api/restaurants/me");
      await authRequest("/api/meals", "POST", {
        restaurant_id: restaurant.restaurant_id,
        name: formData.name,
        description: formData.description,
        ingredients: formData.ingredients,
        calories: Number(formData.calories),
        protein_g: Number(formData.protein_g),
        carbs_g: Number(formData.carbs_g),
        fats_g: Number(formData.fats_g),
        image_url: formData.image_url,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      navigate("/restaurant/meals");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .am-body { background: #fafaf4; min-height: 100vh; padding: 48px 64px; font-family: 'Plus Jakarta Sans', sans-serif; color: #1a1c19; }
        .am-card { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(26,28,25,0.04); }
        .am-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 24px; font-weight: 700; margin-bottom: 20px; }
        .am-field { display: flex; flex-direction: column; gap: 6px;margin-bottom: 16px; }
        .am-label { font-size: 13px; font-weight: 600; color: #414941; }
        .am-input, .am-textarea { width: 100%; padding: 12px 14px; border-radius: 10px; background: #f4f4ee; border: 2px solid transparent; font-size: 14px; box-sizing: border-box; font-family: inherit; }
        .am-input:focus, .am-textarea:focus { outline: none; border-color: #325f3f; background: #fff; }
        .am-textarea { min-height: 70px; resize: vertical; }
        .am-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .am-error { color: #b3261e; font-size: 14px; margin-bottom: 16px; }
        .am-actions { display: flex; gap: 12px; margin-top: 8px; }
        .am-submit-btn { flex: 1; background: #325f3f; color: #fff; border: none; height: 48px; border-radius: 9999px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .am-submit-btn:disabled { opacity: 0.7; cursor: not-allowed;}
        .am-cancel-link { display: flex; align-items: center; justify-content: center; padding: 0 20px; font-size: 14px; font-weight: 600; color: #414941; text-decoration: none; }
      `}</style>

      <div className="am-body">
        <div className="am-card">
          <h1 className="am-title">Add New Meal</h1>

          <form onSubmit={handleSubmit}>
            <div className="am-field">
              <label className="am-label">Name</label>
              <input className="am-input" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="am-field">
              <label className="am-label">Description</label>
              <textarea className="am-textarea" name="description" value={formData.description} onChange={handleChange} required />
            </div>

            <div className="am-field">
              <label className="am-label">Ingredients</label>
              <textarea className="am-textarea" name="ingredients" value={formData.ingredients} onChange={handleChange} required />
            </div>

            <div className="am-field">
              <label className="am-label">Image URL</label>
              <input className="am-input" name="image_url" placeholder="https://..." value={formData.image_url} onChange={handleChange} required />
            </div>

            <div className="am-field">
              <label className="am-label">Category / Tags (comma separated)</label>
              <input className="am-input" name="tags" placeholder="High Protein, Low Carb" value={formData.tags} onChange={handleChange} required />
            </div>

            <div className="am-field">
              <label className="am-label">Nutrition (per serving)</label>
              <div className="am-row3">
                <input className="am-input" type="text" inputMode="numeric" pattern="[0-9]*" name="calories" placeholder="Calories" value={formData.calories} onChange={handleChange} required />
                <input className="am-input" type="text" inputMode="numeric" pattern="[0-9]*" name="protein_g" placeholder="Protein (g)" value={formData.protein_g} onChange={handleChange} required />
                <input className="am-input" type="text" inputMode="numeric" pattern="[0-9]*" name="carbs_g" placeholder="Carbs (g)" value={formData.carbs_g} onChange={handleChange} required />
              </div>
              <input className="am-input" type="text" inputMode="numeric" pattern="[0-9]*" name="fats_g" placeholder="Fats (g)" value={formData.fats_g} onChange={handleChange} required style={{ marginTop: "10px" }} />
            </div>

            {error && <p className="am-error">{error}</p>}

            <div className="am-actions">
              <Link to="/restaurant/meals" className="am-cancel-link">Cancel</Link>
              <button className="am-submit-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Add Meal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddMeal;
