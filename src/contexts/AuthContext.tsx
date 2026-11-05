import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  loginGestao: (email: string, password: string) => Promise<void>;
  loginPatient: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isGestao: boolean;
  isPatient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fisio_user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('fisio_auth_token');
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('fisio_auth_token');
      if (savedToken) {
        try {
          const res = await api.get('/api/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('fisio_user_data', JSON.stringify(res.data.user));
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  const loginGestao = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('fisio_auth_token', res.data.token);
      localStorage.setItem('fisio_user_data', JSON.stringify(res.data.user));
    } else {
      throw new Error(res.data.message || 'Erro ao realizar login.');
    }
  };

  const loginPatient = async (identifier: string, password: string) => {
    const res = await api.post('/api/auth/login-patient', { identifier, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('fisio_auth_token', res.data.token);
      localStorage.setItem('fisio_user_data', JSON.stringify(res.data.user));
    } else {
      throw new Error(res.data.message || 'Erro ao realizar login.');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fisio_auth_token');
    localStorage.removeItem('fisio_user_data');
  };

  const role = user?.role || null;
  const isAuthenticated = !!token && !!user;
  const isGestao = isAuthenticated && role !== 'paciente';
  const isPatient = isAuthenticated && role === 'paciente';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isLoading,
        loginGestao,
        loginPatient,
        logout,
        isAuthenticated,
        isGestao,
        isPatient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};

