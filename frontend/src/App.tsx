import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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
import PostModal from './components/PostModal';
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <AutoThemeProvider>
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
        
        {/* Floating action button matching Dashboard.css aesthetic */}
        <button onClick={handleOpenModal} className="fab-button">
          <span className="plus-icon">+</span>
        </button>
        
        {/* Post Creation Modal */}
        <PostModal isOpen={isModalOpen} onClose={handleCloseModal} />
      </div>
    </AutoThemeProvider>
  );
};

export default App;