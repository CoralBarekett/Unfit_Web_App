import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const OAuthCallback: React.FC = () => {
  const { setUser, setIsAuthenticated, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<string>('Processing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear any previous auth errors
    if (clearError) clearError();
    
    const handleCallback = async () => {
      try {
        setStatus('Verifying authentication...');
        
        // Get token from URL parameters
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('accessToken');
        const errorMsg = params.get('error');
        
        if (errorMsg) {
          setError(decodeURIComponent(errorMsg));
          setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
        }
        
        if (!accessToken) {
          setError('No access token found in the URL');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
        }
        
        // Store token
        localStorage.setItem('accessToken', accessToken);
        
        // Set auth header with Bearer prefix
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        try {
          setStatus('Fetching user data...');
          
          // Get user info - use the correct API URL
          const API_URL = 'http://localhost:3001'; // Make sure this matches your backend
          const response = await axios.get(`${API_URL}/auth/user`);
          
          if (response.data) {
            // Update auth context
            setUser(response.data);
            setIsAuthenticated(true);
            
            // Get stored redirect path or default to dashboard
            const redirectPath = sessionStorage.getItem('redirectPath') || '/dashboard';
            sessionStorage.removeItem('redirectPath'); // Clean up after use
            
            setStatus(`Authentication successful! Redirecting to ${redirectPath}...`);
            
            // Update history state to prevent back button issues
            window.history.replaceState(
              { isAuthenticated: true },
              document.title,
              redirectPath
            );
            
            // Navigate to the intended destination
            setTimeout(() => navigate(redirectPath, { replace: true }), 1000);
          } else {
            throw new Error('Invalid user data received');
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError("Failed to fetch user data. Please try again.");
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
      } catch (e) {
        console.error('OAuth callback processing error:', e);
        setError("Authentication process failed. Please try again.");
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };
    
    handleCallback();
    
    // Cleanup function
    return () => {
      // Remove URL parameters to prevent state conflicts
      if (window.history.replaceState) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    };
  }, [navigate, location, setUser, setIsAuthenticated, clearError]);

  return (
    <div className="oauth-callback">
      <h2 className="form-title">Authentication in Progress</h2>
      {error ? (
        <div className="error-message">
          <p>{error}</p>
          <p>Redirecting to login page...</p>
        </div>
      ) : (
        <>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p className="text-center">{status}</p>
        </>
      )}
    </div>
  );
};

export default OAuthCallback;