import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';
import { getAccessToken, getRefreshToken, clearAuthTokens, AUTH_STORAGE_KEY } from '../services/api';

/**
 * DIGITAL WORLD TOUR & TRAVELS - AUTH CONTEXT
 * Real Django REST API JWT integration with robust session management.
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to normalize user object across backend & frontend expectations
  const formatUser = (userData) => {
    if (!userData) return null;
    const rawRole = (userData.role || 'CUSTOMER').toUpperCase();
    const normalizedRole = rawRole === 'ADMIN' || rawRole === 'STAFF' ? 'admin' : 'customer';

    return {
      id: userData.id,
      name: userData.full_name || userData.name || userData.email?.split('@')[0],
      email: userData.email,
      phone: userData.phone || '',
      role: normalizedRole,
      rawRole: rawRole,
      isActive: userData.is_active ?? true,
      isStaff: userData.is_staff || rawRole === 'ADMIN' || rawRole === 'STAFF',
      createdAt: userData.created_at || userData.date_joined,
    };
  };

  // Check existing session & restore current user from backend on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const meData = await authService.getMe();
        const formatted = formatUser(meData);
        setUser(formatted);
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        clearAuthTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login with email and password
   */
  const login = async ({ email, password, rememberMe = true }) => {
    setLoading(true);
    try {
      const result = await authService.login({ email, password, rememberMe });
      const formatted = formatUser(result.user);
      setUser(formatted);
      setLoading(false);
      return formatted;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  /**
   * Quick 1-Click Demo Customer Login
   * Uses backend seeded user credentials (with fallback support)
   */
  const loginAsDemoCustomer = async () => {
    try {
      return await login({
        email: 'customer@digitalworld.com',
        password: 'CustomerPass2026!',
        rememberMe: true,
      });
    } catch (e) {
      // Fallback if password was altered in testing
      return await login({
        email: 'sonu.sah@gmail.com',
        password: 'password123',
        rememberMe: true,
      });
    }
  };

  /**
   * Quick 1-Click Demo Admin Login
   * Uses backend seeded superuser credentials
   */
  const loginAsDemoAdmin = async () => {
    try {
      return await login({
        email: 'admin@digitalworld.com',
        password: 'AdminPass2026!',
        rememberMe: true,
      });
    } catch (e) {
      return await login({
        email: 'admin@digitalworldtravel.com',
        password: 'adminPassword123',
        rememberMe: true,
      });
    }
  };

  /**
   * Register a new customer
   */
  const register = async ({ fullName, email, phone, password, confirmPassword }) => {
    setLoading(true);
    try {
      const result = await authService.register({ fullName, email, phone, password, confirmPassword });
      const formatted = formatUser(result.user);
      setUser(formatted);
      setLoading(false);
      return formatted;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  /**
   * Forgot password helper
   */
  const forgotPassword = async (email) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      message: `Password reset instructions sent to ${email}`,
    };
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    const refresh = getRefreshToken();
    await authService.logout(refresh);
    setUser(null);
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    loginAsDemoCustomer,
    loginAsDemoAdmin,
    register,
    forgotPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
