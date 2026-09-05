import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('coopserve_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Load user profile on mount if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('coopserve_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Session restoration failed:', err.message);
        }
      }

      // Default demo customer user
      const defaultDemoCustomer = {
        id: 'usr_customer_demo',
        name: 'Ananya Sharma',
        email: 'customer@coopserve.demo',
        role: 'CUSTOMER',
        location: 'Kothrud, Pune',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        rewardsPoints: 450
      };

      try {
        const demoRes = await api.demoLogin('CUSTOMER');
        if (demoRes.success && demoRes.user) {
          localStorage.setItem('coopserve_token', demoRes.token);
          setToken(demoRes.token);
          setUser(demoRes.user);
        } else {
          setUser(defaultDemoCustomer);
        }
      } catch (err) {
        setUser(defaultDemoCustomer);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success) {
        localStorage.setItem('coopserve_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role, notify = true) => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(role);
      if (res.success) {
        localStorage.setItem('coopserve_token', res.token);
        setToken(res.token);
        setUser(res.user);
        if (notify) {
          showToast(`Switched to Demo ${res.user.role}: ${res.user.name}`, 'info');
        }
        return { success: true, user: res.user };
      }
    } catch (err) {
      console.error('Demo login error:', err);
      // Fallback local demo profile
      const localUsers = {
        CUSTOMER: {
          id: 'usr_customer_demo',
          name: 'Ananya Sharma',
          email: 'customer@coopserve.demo',
          role: 'CUSTOMER',
          location: 'Kothrud, Pune',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          rewardsPoints: 450
        },
        SERVICE_PROVIDER: {
          id: 'usr_provider_demo',
          name: 'Rahul Sharma',
          email: 'provider@coopserve.demo',
          role: 'SERVICE_PROVIDER',
          skill: 'Electrician & Home Wiring',
          trustScore: 94,
          rating: 4.88,
          isVerified: true,
          location: 'Shivajinagar, Pune',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        },
        ADMIN: {
          id: 'usr_admin_demo',
          name: 'Vikramaditya Deshmukh',
          email: 'admin@coopserve.demo',
          role: 'ADMIN',
          title: 'Cooperative Operations Lead',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
        }
      };
      const fallbackUser = localUsers[role.toUpperCase()] || localUsers.CUSTOMER;
      setUser(fallbackUser);
      if (notify) {
        showToast(`Active as Demo ${fallbackUser.role}: ${fallbackUser.name}`, 'info');
      }
      return { success: true, user: fallbackUser };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await api.register(userData);
      if (res.success) {
        localStorage.setItem('coopserve_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast(`Registration successful! Welcome to CoopServe, ${res.user.name}.`, 'success');
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('coopserve_token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        demoLogin,
        register,
        logout,
      }}
    >
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
