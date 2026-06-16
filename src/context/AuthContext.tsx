'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, db } from '@/lib/db';
import { DashboardUser } from '@/lib/mockData';

interface AuthContextType {
  user: DashboardUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  hasAccess: (allowedRoles: ('Admin' | 'Manager' | 'Staff')[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage / session storage first for mock
    if (typeof window !== 'undefined') {
      const savedUser = sessionStorage.getItem('gpt_auth_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setLoading(false);
        return;
      }
    }

    // Otherwise use firebase auth changes if configured
    const unsubscribe = authService.onAuthChanged((u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('gpt_auth_user', JSON.stringify(loggedUser));
      }
    } catch (err) {
      setUser(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('gpt_auth_user');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('gpt_auth_user');
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager' || user?.role === 'Admin';
  const isStaff = user?.role === 'Staff' || user?.role === 'Manager' || user?.role === 'Admin';

  const hasAccess = (allowedRoles: ('Admin' | 'Manager' | 'Staff')[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin,
        isManager,
        isStaff,
        hasAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
