import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          🍽️ Qooti
        </Link>
      </div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/restaurants">Restaurants</Link></li>
        <li><Link to="/meal-plans">Meal Plans</Link></li>
      </ul>

      <div className="nav-right">
        <Link to="/login" className="login">Login</Link>
        <Link to="/register">
          <button className="signup-btn">Sign Up</button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;