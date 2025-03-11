/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define user interface with all profile fields
interface User {
  _id: string;
  email: string;
  username?: string;
  profileImage?: string;
  bio?: string;
  fullName?: string;
  googleId?: string;
  facebookId?: string;
}

// Define context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  register: (userData: RegisterData) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  loginWithFacebook: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuthenticated: (isAuth: boolean) => void;
  clearError: () => void;
}

// Define register data interface
interface RegisterData {
  email: string;
  username?: string;
  password: string;
}

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  register: async () => false,
  login: async () => false,
  logout: async () => {},
  loginWithGoogle: () => {},
  loginWithFacebook: () => {},
  setUser: () => {},
  setIsAuthenticated: () => {},
  clearError: () => {}
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use relative URL paths instead of hardcoded base URL
  // This will work with Vite's proxy configuration
  const API_BASE = '';
  const AUTH_API = `${API_BASE}/auth`;

  // Configure axios defaults
  axios.defaults.withCredentials = true; // Enable credentials for all requests

  const clearError = () => setError(null);

  // Function to check authentication status
  const checkAuthStatus = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user data
      const response = await axios.get(`${AUTH_API}/user`);
      
      if (response.data && response.data._id) {
        setUser(response.data);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      
      // Try to refresh token
      try {
        const refreshResponse = await axios.post(`${AUTH_API}/refresh`);
        
        if (refreshResponse.data && refreshResponse.data.accessToken) {
          localStorage.setItem('accessToken', refreshResponse.data.accessToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
          
          // Try fetching user again
          const userResponse = await axios.get(`${AUTH_API}/user`);
          
          if (userResponse.data && userResponse.data._id) {
            setUser(userResponse.data);
            setIsAuthenticated(true);
          }
        }
      } catch (refreshErr) {
        // If refresh fails, clear token and authentication state
        localStorage.removeItem('accessToken');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Setup event listener for OAuth success
    const handleOAuthSuccess = (e: MessageEvent) => {
      if (e.data && e.data.type === 'oauth-success' && e.data.accessToken) {
        localStorage.setItem('accessToken', e.data.accessToken);
        checkAuthStatus();
      }
    };
    
    // Listen for popstate events (back/forward navigation)
    const handlePopState = () => {
      // Re-validate authentication when navigating through history
      checkAuthStatus();
    };

    // Listen for storage events (in case token changes in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        checkAuthStatus();
      }
    };

    window.addEventListener('message', handleOAuthSuccess);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('message', handleOAuthSuccess);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Register new user
  const register = async (userData: RegisterData): Promise<boolean> => {
    setError(null);
    try {
      console.log('Attempting to register with:', userData);
      
      const response = await axios.post(`${AUTH_API}/register`, userData);
      console.log('Registration response:', response.data);
      
      if (response.data && response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Registration error:', err.response || err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      return false;
    }
  };

  // Login user
  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      console.log('Attempting login for:', email);
      
      const response = await axios.post(`${AUTH_API}/login`, { email, password });
      console.log('Login response:', response.data);
      
      if (response.data && response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Login error:', err.response || err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    try {
      // Only attempt to call logout endpoint if we're authenticated
      if (isAuthenticated) {
        await axios.post(`${AUTH_API}/logout`);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Social login redirects
  const loginWithGoogle = (): void => {
    // Store current path to redirect back after authentication
    sessionStorage.setItem('redirectPath', window.location.pathname);
    
    // Open Google OAuth in the same window
    window.location.href = `${AUTH_API}/google`;
  };

  const loginWithFacebook = (): void => {
    // Store current path to redirect back after authentication
    sessionStorage.setItem('redirectPath', window.location.pathname);
    
    // Open Facebook OAuth in the same window
    window.location.href = `${AUTH_API}/facebook`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        loginWithGoogle,
        loginWithFacebook,
        setUser,
        setIsAuthenticated,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};