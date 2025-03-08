import React, { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/**
 * Enhanced history manager that properly handles browser navigation and page state
 * with specific focus on authentication state preservation.
 */
const HistoryManager: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useContext(AuthContext);

  // Track current and previous paths to detect navigation direction
  useEffect(() => {
    // Create a custom history stack in sessionStorage
    const updateHistoryStack = () => {
      try {
        // Get existing history stack or initialize new one
        const historyStackString = sessionStorage.getItem('appHistoryStack');
        const historyStack = historyStackString 
          ? JSON.parse(historyStackString) 
          : [];
        
        // Don't add duplicate entries for the same path
        if (historyStack.length === 0 || historyStack[historyStack.length - 1] !== location.pathname) {
          // Add current location to stack
          historyStack.push(location.pathname);
          // Limit stack size to prevent memory issues
          if (historyStack.length > 10) {
            historyStack.shift();
          }
          sessionStorage.setItem('appHistoryStack', JSON.stringify(historyStack));
        }
        
        // Store current location state for future reference
        sessionStorage.setItem('currentPath', location.pathname);
        
        // Save authentication state with the current URL
        const pathStateKey = `path-state-${location.pathname}`;
        sessionStorage.setItem(pathStateKey, JSON.stringify({
          isAuthenticated,
          timestamp: new Date().getTime()
        }));
      } catch (error) {
        console.error("Error updating history stack:", error);
      }
    };
    
    if (!loading) {
      updateHistoryStack();
    }
  }, [location.pathname, isAuthenticated, loading]);

  // Handle popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Detect which direction we're navigating
      try {
        const currentPath = sessionStorage.getItem('currentPath') || '/';
        const historyStackString = sessionStorage.getItem('appHistoryStack');
        const historyStack = historyStackString 
          ? JSON.parse(historyStackString) 
          : [];
        
        // If we're on a protected route but no longer authenticated, redirect to login
        const pathStateKey = `path-state-${location.pathname}`;
        const pathStateString = sessionStorage.getItem(pathStateKey);
        const pathState = pathStateString ? JSON.parse(pathStateString) : null;
        
        const isProtectedRoute = location.pathname.includes('/dashboard') || 
                               location.pathname.includes('/profile') ||
                               location.pathname.includes('/settings');
        
        // Force navigation to appropriate page based on auth state
        if (isProtectedRoute && !isAuthenticated) {
          // Store the path they were trying to access
          sessionStorage.setItem('intendedPath', location.pathname);
          navigate('/login', { replace: true });
          return;
        }
        
        // Handle OAuth callback path specially to avoid redirect loops
        if (location.pathname === '/oauth-success') {
          return;
        }
        
        // If navigating to login/register while authenticated, redirect to dashboard
        if ((location.pathname === '/login' || location.pathname === '/register') && isAuthenticated) {
          navigate('/dashboard', { replace: true });
          return;
        }
        
        // Update the document title to match the current route
        document.title = `Your App - ${location.pathname.substring(1) || 'Home'}`;
        
      } catch (error) {
        console.error("Error handling popstate:", error);
      }
    };

    // This handles manual URL changes too
    handlePopState({} as PopStateEvent);
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname, isAuthenticated, navigate]);

  return null; // This component doesn't render anything
};

export default HistoryManager;