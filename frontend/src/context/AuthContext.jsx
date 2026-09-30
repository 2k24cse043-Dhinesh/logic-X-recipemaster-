import { createContext, useContext, useEffect, useState } from 'react';
import api, { hasCsrfCookie, setAccessToken } from '../services/api.js';
import { useLanguage } from './LanguageContext.jsx';

const AuthContext = createContext(null);
let sessionRestorePromise;

export function AuthProvider({ children }) {
  const { setLanguage } = useLanguage();
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;
    if (!hasCsrfCookie()) {
      setInitializing(false);
      return () => { active = false; };
    }
    sessionRestorePromise ||= api.post('/auth/refresh').finally(() => { sessionRestorePromise = null; });
    sessionRestorePromise.then(({ data }) => {
      if (!active) return;
      setAccessToken(data.data.accessToken);
      setUser(data.data.user);
      setLanguage(data.data.user.preferredLanguage || 'en');
    }).catch(() => {
      setAccessToken(null);
      if (active) setUser(null);
    }).finally(() => {
      if (active) setInitializing(false);
    });
    return () => { active = false; };
  }, []);

  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    setLanguage(data.data.user.preferredLanguage || 'en');
    return data.data.user;
  }

  async function register(values) {
    const { data } = await api.post('/auth/register', values);
    setLanguage(values.preferredLanguage || 'en');
    return data.data;
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  const value = { user, initializing, login, register, logout, setUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}