import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';
import FacebookLoginButton from './FacebookLoginButton';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);
  const { login, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError(); // Clear any previous errors
    setLoginFailed(false);
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError(); // Clear any previous errors
    setLoginFailed(false);
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setLoginFailed(true);
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginFailed(true);
    }
  };

  return (
    <div className="login-container">
      <h2 className="form-title">Login to Unf:t</h2>
      
      {/* Display either context error or login failure message */}
      {(error || loginFailed) && (
        <div className="error-message">
          {error || "Login failed. Please check your credentials."}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
          Log In
        </button>
      </form>
      
      <div className="social-login">
        <div className="social-divider">
          <span>OR</span>
        </div>
        
        <GoogleLoginButton />
        <FacebookLoginButton />
      </div>
      
      <div className="register-link">
        Don't have an account? <Link to="/register">Register here</Link>
      </div>
    </div>
  );
};

export default Login;