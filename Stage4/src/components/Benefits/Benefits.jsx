import "./Benefits.css";
import { FaLeaf, FaSlidersH, FaClock } from "react-icons/fa";

function Benefits() {
  return (
    <section className="benefits">
      <h2>Why Choose Qooti</h2>

      <div className="title-line"></div>

      <div className="benefits-cards">

        <div className="card">
          <div className="icon green">
            <FaLeaf size={20} />
          </div>

          <h3>Ultimate Freshness</h3>

          <p>
            Sourced from organic local farms every morning.
            We never freeze our meals, ensuring maximum
            nutrient retention and flavor profile.
          </p>
        </div>

        <div className="card">
          <div className="icon gray">
            <FaSlidersH size={20} />
          </div>

          <h3>Pure Customization</h3>

          <p>
            Our AI-driven algorithm adjusts your
            macro ratios based on your fitness data.
            Every meal is literally made for your body.
          </p>
        </div>

        <div className="card">
          <div className="icon gray">
            <FaClock size={20} />
          </div>

          <h3>Daily Convenience</h3>

          <p>
            Arrives at your doorstep before 7 AM
            in compostable thermal packaging.
            Ready to eat in under three minutes.
          </p>
        </div>

      </div>
    </section>
  );
}

export default Benefits;