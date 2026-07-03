import "./Navbar.css";

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
        <a href="#" className="login">Login</a>

        <button className="signup-btn">
          Sign Up
        </button>
      </div>
    </nav>
  );
}

export default Navbar;