import { useNavigate } from "react-router-dom";
import "./Hero.css";
import heroImage from "../../assets/hero.png";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">

      <div className="hero-content">

        <span className="hero-badge">
          Nutrition Science Meets Culinary Art
        </span>

        <h1>
          Effortless Health
          <br />
          Delivered to Your Door
        </h1>

        <p>
          Premium, chef-prepared meals tailored to your biometric needs.
          Skip the prep, ignore the dishes, and focus on what matters most.
        </p>

        <div className="hero-buttons">
          <button className="primary-btn" onClick={() => navigate("/restaurants")}>
            Subscribe Now
          </button>

          <button className="secondary-btn" onClick={() => navigate("/restaurants")}>
            Explore Menu
          </button>
        </div>

      </div>

      <div className="hero-image">
        <img src={heroImage} alt="Healthy Meal" />
      </div>

    </section>
  );
}

export default Hero;
