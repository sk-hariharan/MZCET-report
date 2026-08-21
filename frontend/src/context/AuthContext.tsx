import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: Record<string, any>) => Promise<any>;
  logout: () => void;
  updateProfile: (profileData: Record<string, any>) => Promise<User>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<any>;
  apiBaseUrl: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('mzcet_token') || null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile when token is available
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setError(null);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Network error: Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const login = async (email: string, password: string): Promise<User> => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('mzcet_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      setError(err.message || 'Login error');
      throw err;
    }
  };

  const register = async (userData: Record<string, any>): Promise<any> => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (err: any) {
      setError(err.message || 'Registration error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('mzcet_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profileData: Record<string, any>): Promise<User> => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      setUser(data.user);
      return data.user;
    } catch (err: any) {
      setError(err.message || 'Profile update error');
      throw err;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<any> => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      return data;
    } catch (err: any) {
      setError(err.message || 'Password change error');
      throw err;
    }
  };

  const value: AuthContextType = {
    token,
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    apiBaseUrl: API_BASE_URL
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
