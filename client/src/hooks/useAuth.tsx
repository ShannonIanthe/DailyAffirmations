import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as api from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, name?: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('daily-affirm-user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('daily-affirm-user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email: string, name?: string) => {
    const { user } = await api.login(email, name);
    setUser(user);
    localStorage.setItem('daily-affirm-user', JSON.stringify(user));
  };

  const handleGuestLogin = async () => {
    const { user } = await api.guestLogin();
    setUser(user);
    localStorage.setItem('daily-affirm-user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('daily-affirm-user');
  };

  const handleUpdateUser = async (data: Partial<User>) => {
    if (!user) return;
    const { user: updated } = await api.updateUser(user.id, data);
    setUser(updated);
    localStorage.setItem('daily-affirm-user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login: handleLogin,
      loginAsGuest: handleGuestLogin,
      logout,
      updateUser: handleUpdateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}