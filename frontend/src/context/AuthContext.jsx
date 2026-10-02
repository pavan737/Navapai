import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('navapai_user');
      return savedUser && savedUser !== 'undefined' ? JSON.parse(savedUser) : null;
    } catch (err) {
      console.error('Failed to parse saved user from storage:', err);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('navapai_access_token');
      if (token) {
        try {
          const res = await api.get('auth/me/');
          setUser(res.data);
          localStorage.setItem('navapai_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Session validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('auth/login/', { email, password });
    const { access, refresh, user: userData } = res.data;
    localStorage.setItem('navapai_access_token', access);
    localStorage.setItem('navapai_refresh_token', refresh);
    localStorage.setItem('navapai_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await api.post('auth/register/', formData);
    const { access, refresh, user: userData } = res.data;
    localStorage.setItem('navapai_access_token', access);
    localStorage.setItem('navapai_refresh_token', refresh);
    localStorage.setItem('navapai_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('navapai_access_token');
    localStorage.removeItem('navapai_refresh_token');
    localStorage.removeItem('navapai_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
