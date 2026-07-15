import "./HowItWorks.css";
import { FaSearch, FaClipboardList, FaTruck } from "react-icons/fa";

function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <h2>How It Works</h2>

      <div className="title-line"></div>

      <div className="how-it-works-steps">

        <div className="step">
          <div className="step-number">1</div>
          <div className="icon green">
            <FaSearch size={20} />
          </div>
          <h3>Browse Restaurants</h3>
          <p>
            Explore our vetted, health-focused restaurant
            partners and discover meals that fit your goals.
          </p>
        </div>

        <div className="step">
          <div className="step-number">2</div>
          <div className="icon gray">
            <FaClipboardList size={20} />
          </div>
          <h3>Select Your Weekly Meals</h3>
          <p>
            Pick a meal for each day, Sunday through Thursday,
            from any of our partner restaurants.
          </p>
        </div>

        <div className="step">
          <div className="step-number">3</div>
          <div className="icon green">
            <FaTruck size={20} />
          </div>
          <h3>Get Delivered</h3>
          <p>
            Fresh, chef-prepared meals arrive at your door
            at the delivery time you choose.
          </p>
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;
