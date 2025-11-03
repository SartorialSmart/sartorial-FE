import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/AuthService';
import { Loader2 } from 'lucide-react';

// Create contexts
const AuthContext = createContext();
const LoadingContext = createContext();

// Custom hooks
export const useAuth = () => useContext(AuthContext);
export const useLoading = () => useContext(LoadingContext);

// Loading Provider Component
const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const showLoading = (message = 'Loading...') => {
    setLoadingMessage(message);
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, loadingMessage }}>
      {children}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center min-w-[300px]">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-4" />
            <p className="text-gray-700 font-medium">{loadingMessage}</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

// Auth Provider Component
const AuthProviderComponent = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { showLoading, hideLoading } = useLoading();

  const register = async (userData) => {
    showLoading('Creating your account...');
    try {
      const response = await AuthService.register(userData);
      hideLoading();
      return response;
    } catch (error) {
      hideLoading();
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const login = async (credentials) => {
    showLoading('Signing you in...');
    try {
      const response = await AuthService.login(credentials);
      
      const accessToken = response.access_token; 
      const refreshToken = response.refresh_token;
  
      if (!accessToken || !refreshToken) {
        throw new Error("Access or Refresh token missing in response");
      }
  
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      
      await fetchAuthenticatedUser();
      hideLoading();
    } catch (error) {
      hideLoading();
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const fetchAuthenticatedUser = async () => {
    const token = localStorage.getItem("accessToken");
  
    if (!token) {
      setAuthLoading(false);
      return;
    }
  
    try {
      showLoading('Loading your session...');
      const userData = await AuthService.getAuthenticatedUser(token);
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch authenticated user:", error.response?.data || error.message);
      logout();
    } finally {
      hideLoading();
      setAuthLoading(false);
    }
  };

  const logout = () => {
    showLoading('Signing out...');
    setTimeout(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      hideLoading();
    }, 500);
  };

  useEffect(() => {
    fetchAuthenticatedUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, authLoading, register, login, logout }}>
      {!authLoading ? children : (
        <div className="fixed inset-0 flex items-center justify-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
        </div>
      )}
    </AuthContext.Provider>
  );
};

// Combined Provider
export const AuthProvider = ({ children }) => {
  return (
    <LoadingProvider>
      <AuthProviderComponent>
        {children}
      </AuthProviderComponent>
    </LoadingProvider>
  );
};