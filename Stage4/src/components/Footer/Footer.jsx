import { useState } from "react";
import "./Footer.css";
import { Globe, ArrowUp } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="footer">

      <div className="footer-top">

        <div className="footer-column">
          <h3>Qooti</h3>

          <p>
            The gold standard in bio-available
            nutrition and effortless premium
            dining.
          </p>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>

          <a href="#">About</a>
          <a href="#faq">FAQ</a>
        </div>

        <div className="footer-column">
          <h4>Social</h4>

          <div className="social-icons">

            <a href="https://www.instagram.com/qooti.sa" target="_blank" rel="noopener noreferrer">
              <FaInstagram size={18} />
            </a>

            <a href="#">
              <Globe size={18} />
            </a>

          </div>
        </div>

        <div className="footer-column">
          <h4>Newsletter</h4>

          {subscribed ? (
            <p style={{ fontSize: "13px" }}>Thanks for subscribing! 🎉</p>
          ) : (
            <form className="newsletter" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button type="submit">
                <ArrowUp size={18} />
              </button>
            </form>
          )}
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 Qooti. Effortless Health.
      </div>

    </footer>
  );
}

export default Footer;
