import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        Quiet Premium
      </div>

      <ul className="nav-links">
        <li><a href="#">Meal Plans</a></li>
        <li><a href="#">Customization</a></li>
        <li><a href="#">Pricing</a></li>
      </ul>

      <div className="nav-right">
        <Link to="/login" className="login">Login</Link>

        <Link to="/register">
          <button className="signup-btn">
            Sign Up
          </button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;