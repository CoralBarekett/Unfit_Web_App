import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * A component that prevents browser cache issues with routes and enforces
 * proper page rendering when navigating through browser history.
 */
const RouteManager: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Set cache control headers to prevent browser caching
  useEffect(() => {
    // Set meta tags to prevent caching
    const setNoCacheHeaders = () => {
      // Find existing meta tags or create new ones
      let metaCache = document.querySelector('meta[http-equiv="Cache-Control"]');
      let metaPragma = document.querySelector('meta[http-equiv="Pragma"]');
      let metaExpires = document.querySelector('meta[http-equiv="Expires"]');

      if (!metaCache) {
        metaCache = document.createElement('meta');
        metaCache.setAttribute('http-equiv', 'Cache-Control');
        document.head.appendChild(metaCache);
      }
      
      if (!metaPragma) {
        metaPragma = document.createElement('meta');
        metaPragma.setAttribute('http-equiv', 'Pragma');
        document.head.appendChild(metaPragma);
      }
      
      if (!metaExpires) {
        metaExpires = document.createElement('meta');
        metaExpires.setAttribute('http-equiv', 'Expires');
        document.head.appendChild(metaExpires);
      }

      // Set values to prevent caching
      metaCache.setAttribute('content', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      metaPragma.setAttribute('content', 'no-cache');
      metaExpires.setAttribute('content', '0');
    };

    setNoCacheHeaders();
  }, []);

  // Force reload dynamic components on history navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear specific session data on page refresh
      // This prevents stale data from persisting across full page reloads
      sessionStorage.removeItem('lastRenderedPath');
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      // If the page is being shown from the bfcache (back-forward cache)
      if (e.persisted) {
        // Force a re-render by doing a soft reload of the current route
        const currentPath = location.pathname;
        navigate(currentPath, { replace: true });
      }
    };

    // Track route changes
    const lastRenderedPath = sessionStorage.getItem('lastRenderedPath');
    sessionStorage.setItem('lastRenderedPath', location.pathname);

    // Ensure each route is fresh on navigation
    if (lastRenderedPath) {
      // Set a timestamp for this route visit
      sessionStorage.setItem(
        `route-timestamp-${location.pathname}`, 
        Date.now().toString()
      );
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [location.pathname, navigate]);

  return null; // This component doesn't render anything
};

export default RouteManager;