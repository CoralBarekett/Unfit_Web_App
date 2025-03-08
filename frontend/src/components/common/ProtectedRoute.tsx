import React, { useContext, ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();
  
  // Store current path when not authenticated for later redirect
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      sessionStorage.setItem('intendedPath', location.pathname + location.search);
    }
  }, [isAuthenticated, loading, location]);

  // Handle browser history behavior
  useEffect(() => {
    if (isAuthenticated) {
      // Update history state to prevent back button issues
      window.history.replaceState(
        { isAuthenticated: true, path: location.pathname },
        document.title,
        location.pathname + location.search
      );
    }
  }, [isAuthenticated, location]);
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login while preserving the current location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;