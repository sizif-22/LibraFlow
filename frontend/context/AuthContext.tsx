'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';


export interface User {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'LIBRARIAN' | 'ADMIN';
  isActive: boolean;
  isVerified: boolean;
}


interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<{
    user: User | null;
    token: string | null;
    isLoading: boolean;
  }>(() => {
    // Initial state logic (Lazy Initializer)
    if (typeof window === 'undefined') {
      return { user: null, token: null, isLoading: true };
    }

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return {
          token: storedToken,
          user: { isActive: true, isVerified: true, ...parsedUser },
          isLoading: false,
        };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return { user: null, token: null, isLoading: false };
  });

  const logout = React.useCallback(() => {
    setAuthState({
      token: null,
      user: null,
      isLoading: false,
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const login = React.useCallback((newToken: string, newUser: User) => {
    setAuthState({
      token: newToken,
      user: newUser,
      isLoading: false,
    });
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  }, []);


  const currentTokenRef = React.useRef<string | null>(null);
  
  useEffect(() => {
    currentTokenRef.current = authState.token;
  }, [authState.token]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAuthError = (event: any) => {
      const failingToken = event.detail?.token;
      if (failingToken && failingToken === currentTokenRef.current) {
        logout();
      }
    };
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, [logout]);




  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
