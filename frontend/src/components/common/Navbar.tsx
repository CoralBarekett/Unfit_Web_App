import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          {/* <img src="/unfit-logo.svg" /> */}
          <span>Unf:t</span>
        </Link>
      </div>
      
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
        </li>
        
        {isAuthenticated ? (
          <>
            <li className="nav-item">
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <button className="btn-link" onClick={logout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/register" className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}>
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;