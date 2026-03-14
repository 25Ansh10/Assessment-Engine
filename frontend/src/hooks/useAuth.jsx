import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import api from '../utils/axiosMock';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('aritexam_token');
    const userData = localStorage.getItem('aritexam_user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('aritexam_token');
        localStorage.removeItem('aritexam_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, isAdmin = false) => {
    const res = await api.post('/auth/login', { email, password, isAdmin });
    const { token, user: userData } = res.data;
    localStorage.setItem('aritexam_token', token);
    localStorage.setItem('aritexam_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (formData) => {
    const res = await api.post('/auth/register', formData);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('aritexam_token');
    localStorage.removeItem('aritexam_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default useAuth;
