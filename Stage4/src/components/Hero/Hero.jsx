import "./Hero.css";
import heroImage from "../../assets/hero.png";

function Hero() {
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
          <button className="primary-btn">
            Subscribe Now
          </button>

          <button className="secondary-btn">
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