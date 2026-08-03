// src/context/AuthProvider.jsx
import { useState, useEffect, useCallback } from 'react'; // ✅ დავამატეთ useCallback
import { AuthContext } from './AuthContext';
import api from '../api/axios';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 1. ჯერ logout-ს ვწერთ, რომ სხვა ფუნქციებმა (მაგ. refreshUser) მასზე წვდომა შეძლოს
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // ✅ 2. refreshUser-ს ვახვევთ useCallback-ში, რომ ის სტაბილური იყოს და არ იცვლებოდეს ყოველ რენდერზე
  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/auth/me');
        const data = response.data.data;
        
        // მონაცემების ნორმალიზება (თუ ბექენდიდან სტრინგად მოდის)
        if (data.profession && !Array.isArray(data.profession)) data.profession = [data.profession];
        if (!data.profession) data.profession = [];
        if (data.cities && !Array.isArray(data.cities)) data.cities = [data.cities];
        if (!data.cities) data.cities = [];

        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      }
    } catch (error) {
      // 🔥 თუ ბექენდიდან მოდის 403 (Banned) ან გვაქვს isBanned
      if (error.response && (error.response.status === 403 || error.response.data?.isBanned)) {
        alert("⚠️ თქვენი ანგარიში დაბლოკილია ადმინის მიერ. გთხოვთ, დაუკავშირდით ადმინს.");
        logout(); // ✅ ახლა უსაფრთხოდ მუშაობს!
        return;
      }
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      }
    }
  }, []); // ცარიელი მასივი ნიშნავს, რომ ფუნქცია არასდროს შეიცვლება

  // ✅ 3. useEffect-ში ვიყენებთ refreshUser-ს, როგორც დამოკიდებულებას
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.profession && !Array.isArray(parsed.profession)) parsed.profession = [parsed.profession];
            if (!parsed.profession) parsed.profession = [];
            setUser(parsed);
          }
          await refreshUser();
        } else {
          setLoading(false);
        }
      } catch (error) {
        if (error.response?.status === 403 || error.response?.data?.isBanned) {
          logout();
        } else if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        setLoading(false);
      }
    };
    initializeAuth();
  }, [refreshUser]); // ✅ აქ დავამატეთ refreshUser, ESLint გაფრთხილება გაქრება

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, data } = response.data;
    if (data.profession && !Array.isArray(data.profession)) data.profession = [data.profession];
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
    if (data.profession && !Array.isArray(data.profession)) data.profession = [data.profession];
    if (!data.profession) data.profession = [];
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(data));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(data);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};