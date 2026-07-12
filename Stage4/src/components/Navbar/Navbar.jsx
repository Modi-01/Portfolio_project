import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" style={{ color: 'DarkGreen', textDecoration: 'none' }}>
          🍽️ Qooti
        </Link>
      </div>

      <ul className="nav-links">
  <li><Link to="/">Home</Link></li>
  <li><Link to="/restaurants">Restaurants</Link></li>
  <li><Link to="/weekly-selection">Meal Plans</Link></li>
  {user?.user_type === "restaurant" && (
    <li><Link to="/restaurant/meals">My Meals</Link></li>
  )}
</ul>

      <div className="nav-right">
        {user ? (
          <>
            <span className="login">{user.full_name}</span>
            <button className="signup-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="login">Login</Link>
            <Link to="/register">
              <button className="signup-btn">Sign Up</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;