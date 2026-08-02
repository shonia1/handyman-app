// src/context/AuthProvider.jsx
import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import api from '../api/axios';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me');
      const data = response.data.data;
      // ensure profession and cities are arrays
      if (data.profession && !Array.isArray(data.profession)) {
        data.profession = [data.profession];
      }
      if (!data.profession) data.profession = [];
      if (data.cities && !Array.isArray(data.cities)) {
        data.cities = [data.cities];
      }
      if (!data.cities) data.cities = [];
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error refreshing user:', error);
    // ...
  }
};

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.profession && !Array.isArray(parsed.profession)) {
              parsed.profession = [parsed.profession];
            }
            if (!parsed.profession) parsed.profession = [];
            setUser(parsed);
          }
          // Always refresh to get latest telegramChatId
          await refreshUser();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, data } = response.data;
    if (data.profession && !Array.isArray(data.profession)) {
      data.profession = [data.profession];
    }
    if (!data.profession) data.profession = [];
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(data));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(data);
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token, data } = response.data;
    if (data.profession && !Array.isArray(data.profession)) {
      data.profession = [data.profession];
    }
    if (!data.profession) data.profession = [];
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(data));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};