import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

interface FormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  const [registrationFailed, setRegistrationFailed] = useState(false);
  const { register, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const { email, username, password, confirmPassword } = formData;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError(); // Clear any previous errors when user types
    setRegistrationFailed(false);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    try {
      const success = await register({
        email,
        username,
        password
      });
      
      if (success) {
        navigate('/dashboard');
      } else {
        setRegistrationFailed(true);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setRegistrationFailed(true);
    }
  };
  
  return (
    <div className="register-container">
      <h2 className="form-title">Create Your Unf:t Account</h2>
      
      {/* Display either context error or registration failure message */}
      {(error || registrationFailed) && (
        <div className="error-message">
          {error || "Registration failed. Please try again."}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>
        
        <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
          Create Account
        </button>
      </form>
      
      <div className="login-link">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default Register;