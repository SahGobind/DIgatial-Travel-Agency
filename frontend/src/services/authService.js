import api, { setAuthTokens, clearAuthTokens, AUTH_STORAGE_KEY } from './api';

/**
 * Authentication Service
 * Endpoints: /api/v1/auth/
 */
export const authService = {
  /**
   * Register a new user
   * POST /api/v1/auth/register/
   */
  async register({ fullName, email, phone, password, confirmPassword }) {
    const payload = {
      full_name: fullName,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: password,
      confirm_password: confirmPassword || password,
    };
    const response = await api.post('/auth/register/', payload);
    const data = response.data?.data || response.data;
    if (data.tokens) {
      setAuthTokens(data.tokens.access, data.tokens.refresh, true);
    }
    return data;
  },

  /**
   * Login user
   * POST /api/v1/auth/login/
   */
  async login({ email, password, rememberMe = true }) {
    const payload = {
      email: email.trim().toLowerCase(),
      password: password,
    };
    const response = await api.post('/auth/login/', payload);
    const data = response.data?.data || response.data;
    if (data.tokens) {
      setAuthTokens(data.tokens.access, data.tokens.refresh, rememberMe);
    }
    return data;
  },

  /**
   * Get Current Authenticated User Profile
   * GET /api/v1/auth/me/
   */
  async getMe() {
    const response = await api.get('/auth/me/');
    return response.data?.data || response.data;
  },

  /**
   * Refresh JWT Token
   * POST /api/v1/auth/token/refresh/
   */
  async refreshToken(refresh) {
    const response = await api.post('/auth/token/refresh/', { refresh });
    return response.data?.data || response.data;
  },

  /**
   * Logout User
   * POST /api/v1/auth/logout/
   */
  async logout(refresh) {
    try {
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch (e) {
      // Ignore backend logout error if token already expired
    } finally {
      clearAuthTokens();
    }
  },
};

export default authService;
