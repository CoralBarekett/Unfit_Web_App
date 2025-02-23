import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define user interface
interface User {
  _id: string;
  email: string;
  username?: string;
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
  loginWithFacebook: () => {}
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // API base URL
  const API_URL = 'http://localhost:3001';

  // Configure axios to include credentials (cookies)
  axios.defaults.withCredentials = true;

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async (): Promise<void> => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Set auth header
        axios.defaults.headers.common['Authorization'] = `JWT ${token}`;
        
        // Fetch user data
        const response = await axios.get(`${API_URL}/auth/user`);
        
        if (response.data && response.data._id) {
          setUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        
        // Try to refresh token
        try {
          const refreshResponse = await axios.post(`${API_URL}/auth/refresh`);
          
          if (refreshResponse.data && refreshResponse.data.accessToken) {
            localStorage.setItem('accessToken', refreshResponse.data.accessToken);
            axios.defaults.headers.common['Authorization'] = `JWT ${refreshResponse.data.accessToken}`;
            
            // Try fetching user again
            const userResponse = await axios.get(`${API_URL}/auth/user`);
            
            if (userResponse.data && userResponse.data._id) {
              setUser(userResponse.data);
              setIsAuthenticated(true);
            }
          }
        } catch (refreshErr) {
          localStorage.removeItem('accessToken');
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Register new user
  const register = async (userData: RegisterData): Promise<boolean> => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (response.data && response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        axios.defaults.headers.common['Authorization'] = `JWT ${response.data.accessToken}`;
        setUser(response.data);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  // Login user
  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data && response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        axios.defaults.headers.common['Authorization'] = `JWT ${response.data.accessToken}`;
        setUser(response.data);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setIsAuthenticated(false);
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Social login redirects
  const loginWithGoogle = (): void => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const loginWithFacebook = (): void => {
    window.location.href = `${API_URL}/auth/facebook`;
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
        loginWithFacebook
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};