import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUserRequest, loginRequest, signupRequest } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ttm_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ttm_token');

    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUserRequest()
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('ttm_user', JSON.stringify(data.user));
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (payload) => {
    localStorage.setItem('ttm_token', payload.token);
    localStorage.setItem('ttm_user', JSON.stringify(payload.user));
    setUser(payload.user);
  };

  const login = async (credentials) => {
    const { data } = await loginRequest(credentials);
    persistSession(data);
  };

  const signup = async (values) => {
    const { data } = await signupRequest(values);
    persistSession(data);
  };

  const logout = () => {
    localStorage.removeItem('ttm_token');
    localStorage.removeItem('ttm_user');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      isMember: user?.role === 'member',
      login,
      signup,
      logout
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
