import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const OAuthCallback: React.FC = () => {
  const { setUser, setIsAuthenticated } = useContext(AuthContext) as any; // Type assertion due to context complexity
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      // Get token from URL parameters
      const params = new URLSearchParams(location.search);
      const accessToken = params.get('accessToken');
      
      if (accessToken) {
        // Store token
        localStorage.setItem('accessToken', accessToken);
        
        // Set auth header
        axios.defaults.headers.common['Authorization'] = `JWT ${accessToken}`;
        
        try {
          // Get user info
          const response = await axios.get('http://localhost:3001/auth/user');
          
          if (response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
            navigate('/dashboard');
          } else {
            navigate('/login');
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };
    
    handleCallback();
  }, [navigate, location, setUser, setIsAuthenticated]);

  return (
    <div className="oauth-callback">
      <h2>Processing authentication...</h2>
      <p>Please wait while we complete the authentication process.</p>
    </div>
  );
};

export default OAuthCallback;