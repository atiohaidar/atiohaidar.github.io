/**
 * @file Authentication hook
 * Centralizes auth logic used across components
 */
import { useState, useEffect, useCallback } from 'react';
import { auth } from '../lib/api';

export interface User {
  username: string;
  name: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load auth state from storage
  useEffect(() => {
    const storedToken = auth.getToken();
    const storedUser = auth.getUser();
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setIsAuthenticated(true);
      setIsAdmin(storedUser.role === 'admin');
    }
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    auth.setToken(newToken);
    auth.setUser(newUser);
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
    setIsAdmin(newUser.role === 'admin');
  }, []);

  const logout = useCallback(() => {
    auth.clear();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  }, []);

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  };
}
