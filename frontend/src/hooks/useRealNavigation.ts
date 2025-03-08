import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect } from 'react';

/**
 * Custom hook that enhances React Router's navigation with better browser history management
 */
export function useRealNavigation() {
  const navigate = useNavigate();

  // Enhanced navigation that manages browser history more effectively
  const realNavigate = useCallback((
    to: string, 
    options?: { replace?: boolean; state?: any; preserveScroll?: boolean }
  ) => {
    // Save current scroll position for the current page if preserving scroll
    if (!options?.preserveScroll) {
      sessionStorage.setItem(
        `scroll-${window.location.pathname}`, 
        JSON.stringify({ x: window.scrollX, y: window.scrollY })
      );
    }

    // Clean URL if navigating to same page (removes query params)
    if (to === window.location.pathname && !options?.replace) {
      window.history.replaceState(
        { ...window.history.state, ...options?.state },
        document.title,
        to
      );
      return;
    }

    // Perform the navigation
    navigate(to, {
      replace: options?.replace || false,
      state: options?.state || {}
    });

    // Ensure we scroll to top when navigating to a new page
    if (!options?.preserveScroll) {
      window.scrollTo(0, 0);
    }
  }, [navigate]);

  // Restore scroll position when navigating back/forward
  useEffect(() => {
    const handlePopState = () => {
      try {
        // Try to restore saved scroll position
        const savedScrollJSON = sessionStorage.getItem(`scroll-${window.location.pathname}`);
        if (savedScrollJSON) {
          const { x, y } = JSON.parse(savedScrollJSON);
          setTimeout(() => {
            window.scrollTo(x, y);
          }, 100); // Small delay to ensure page has rendered
        }
      } catch (error) {
        console.error("Error restoring scroll position:", error);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return realNavigate;
}

export default useRealNavigation;