import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User, LoginCredentials, RegisterData} from '../types';
import ApiService from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await ApiService.login(credentials);
    await AsyncStorage.setItem('token', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (data: RegisterData) => {
    const response = await ApiService.register(data);

    if (data.role === 'caregiver') {
      // Store token temporarily so the document upload (which requires auth) can run.
      // Do NOT set user state — this keeps RootNavigator on the Auth stack,
      // letting the registration screen navigate to Login after upload completes.
      await AsyncStorage.setItem('token', response.token);
    } else {
      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(prev => {
      const merged = prev ? {...prev, ...updatedUser} : updatedUser;
      AsyncStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  // Fetches fresh user data from /api/auth/me and updates stored state.
  // Used on the pending screen so caregivers can check approval status.
  const refreshUserStatus = async () => {
    try {
      const response = await ApiService.getMe();
      const freshUser: User = response.data.data.user;
      await AsyncStorage.setItem('user', JSON.stringify(freshUser));
      setUser(freshUser);
    } catch (error: any) {
      // If the request fails (e.g. deactivated account / expired token), log out
      console.error('refreshUserStatus failed:', error?.response?.data || error);
      await logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{user, token, loading, login, register, logout, updateUser, refreshUserStatus}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
