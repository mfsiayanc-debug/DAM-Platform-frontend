import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import * as api from '../services/api';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = 'dam_jwt';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
      api.setAuthToken(storedToken);
      // We don't have a "me" endpoint; user will be re-hydrated on next login
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await api.login(email, password);
    setUser(user);
    setToken(token);
    localStorage.setItem(TOKEN_KEY, token);
    api.setAuthToken(token);
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const { user, token } = await api.signup(email, password);
    setUser(user);
    setToken(token);
    localStorage.setItem(TOKEN_KEY, token);
    api.setAuthToken(token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    api.setAuthToken(null);
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!token,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
