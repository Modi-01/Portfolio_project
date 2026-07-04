import "./Footer.css";
import { Globe, ArrowUp } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-top">

        <div className="footer-column">
          <h3>Quiet Premium</h3>

          <p>
            The gold standard in bio-available
            nutrition and effortless premium
            dining.
          </p>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>

          <a href="#">About</a>
          <a href="#">FAQ</a>
          <a href="#">Contact</a>
        </div>

        <div className="footer-column">
          <h4>Social</h4>

          <div className="social-icons">

            <a href="#">
              <FaInstagram size={18} />
            </a>

            <a href="#">
              <Globe size={18} />
            </a>

          </div>
        </div>

        <div className="footer-column">
          <h4>Newsletter</h4>

          <div className="newsletter">

            <input
              type="email"
              placeholder="Your email"
            />

            <button>
              <ArrowUp size={18} />
            </button>

          </div>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 Quiet Premium. Effortless Health.
      </div>

    </footer>
  );
}

export default Footer;