// src/components/Header.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser, getCurrentUser, isAuthenticated } from '../services/auth';

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      if (authenticated) {
        setUser(getCurrentUser());
      } else {
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuth(false);
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuth(false);
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/">Qooti</Link>
        </div>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/restaurants">Restaurants</Link>
          <Link to="/meal-plans">Meal Plans</Link>
          
          {isAuth && user?.role === 'customer' && (
            <Link to="/dashboard">Dashboard</Link>
          )}
          
          {isAuth && user?.role === 'restaurant' && (
            <Link to="/restaurant/dashboard">Dashboard</Link>
          )}
          
          {isAuth && user?.role === 'admin' && (
            <Link to="/admin/dashboard">Dashboard</Link>
          )}
        </div>

        <div className="nav-actions">
          {isAuth ? (
            <div className="user-menu">
              <span className="user-name">
                {user?.name || user?.fullName || 'User'}
              </span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/register" className="register-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;