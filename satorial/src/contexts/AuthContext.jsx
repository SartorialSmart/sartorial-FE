import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const register = async (userData) => {
    try {
      return await AuthService.register(userData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await AuthService.login(credentials);
      
      console.log("Full Login API Response:", response); 

      const accessToken = response.access_token; 
      const refreshToken = response.refresh_token;
  
      if (!accessToken || !refreshToken) {
        console.error("Response missing tokens:", response);
        throw new Error("Access or Refresh token missing in response");
      }
  
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      
      await fetchAuthenticatedUser();
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  };
  
  


  const fetchAuthenticatedUser = async () => {
    const token = localStorage.getItem("accessToken");
  
    if (!token) {
      setLoading(false);
      return;
    }
  
    try {
      const userData = await AuthService.getAuthenticatedUser(token);
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch authenticated user:", error.response?.data || error.message);
      logout();
    } finally {
      setLoading(false);
    }
  };
  

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  useEffect(() => {
    fetchAuthenticatedUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {!loading ? children : <div>Loading application...</div>}
    </AuthContext.Provider>
  );
};
