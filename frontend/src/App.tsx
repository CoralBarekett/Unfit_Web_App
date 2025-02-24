import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AutoThemeProvider from './components/theme/AutoThemeProvider';
import HistoryManager from './components/common/HistoryManager';
import RouteManager from './components/common/RouteManager';

import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OAuthCallback from './components/auth/OAuthCallback';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

// Component to scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  // Force cache busting for the entire app
  useEffect(() => {
    // Add a random query parameter to all internal links to prevent caching
    const addCacheBusterToLinks = () => {
      const timestamp = new Date().getTime();
      const links = document.querySelectorAll('a[href^="/"]');
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('_cb=')) {
          const separator = href.includes('?') ? '&' : '?';
          link.setAttribute('href', `${href}${separator}_cb=${timestamp}`);
        }
      });
    };

    // Set up a MutationObserver to handle dynamically added links
    const observer = new MutationObserver(() => {
      addCacheBusterToLinks();
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <AutoThemeProvider>
      <AuthProvider>
        <Router>
          {/* History and route management components */}
          <HistoryManager />
          <RouteManager />
          <ScrollToTop />
          
          <div className="app">
            <Navbar />
            <main className="main-content">
              <div className="container">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/oauth-success" element={<OAuthCallback />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  {/* Add a catch-all route for any unmatched routes */}
                  <Route
                    path="*"
                    element={<HomePage />}
                  />
                </Routes>
              </div>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </AutoThemeProvider>
  );
};

export default App;