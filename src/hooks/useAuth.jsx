import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import api from '../utils/axiosMock';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userData = localStorage.getItem('arithexam_user');
    if (isLoggedIn === 'true' && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('arithexam_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    // Instant login logic
    const userData = {
      id: "AE-" + Math.floor(Math.random() * 900000 + 100000),
      name: email.split('@')[0].replace(/[._]/g, ' '),
      email: email,
      role: 'CANDIDATE'
    };
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('arithexam_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const userData = {
      id: data.examId || ("AE-" + Math.floor(Math.random() * 900000 + 100000)),
      name: data.name || 'Candidate',
      email: data.email,
      photo: data.photo, // Save the base64 photo
      regDate: data.regDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      role: 'CANDIDATE'
    };
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('arithexam_user', JSON.stringify(userData));
    setUser(userData);
    return { user: userData };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('arithexam_user');
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
