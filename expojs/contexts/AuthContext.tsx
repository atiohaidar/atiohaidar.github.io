import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import ApiService from '@/services/api';
import { User, LoginRequest } from '@/types/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await ApiService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        // Attempt to refresh with fresh data in background
        refreshUserData(currentUser.username);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch fresh user data from backend
  const refreshUserData = async (username: string) => {
    try {
      const freshUser = await ApiService.getUser(username);
      if (freshUser) {
        setUser(freshUser);
        // Update AsyncStorage as well
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.setItem('currentUser', JSON.stringify(freshUser));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const refreshUser = useCallback(async () => {
    if (user?.username) {
      await refreshUserData(user.username);
    }
  }, [user?.username]);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await ApiService.login(credentials);
      setUser(response.user);
      // Immediately fetch fresh data to get balance
      if (response.user?.username) {
        refreshUserData(response.user.username);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated,
        isAdmin,
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
