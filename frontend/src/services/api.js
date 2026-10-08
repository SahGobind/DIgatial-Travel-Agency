import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const AUTH_STORAGE_KEY = 'dw_auth_session';
export const ACCESS_TOKEN_KEY = 'dw_access_token';
export const REFRESH_TOKEN_KEY = 'dw_refresh_token';

/**
 * Global Axios API Instance for Digital World Tour & Travels
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

/**
 * Token Helpers
 */
export const getAccessToken = () => {
  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    sessionStorage.getItem(ACCESS_TOKEN_KEY) ||
    null
  );
};

export const getRefreshToken = () => {
  return (
    localStorage.getItem(REFRESH_TOKEN_KEY) ||
    sessionStorage.getItem(REFRESH_TOKEN_KEY) ||
    null
  );
};

export const setAuthTokens = (access, refresh, rememberMe = true) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  if (access) storage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) storage.setItem(REFRESH_TOKEN_KEY, refresh);
};

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
};

// Request interceptor: attach Authorization header
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData, allow browser to set boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unified response unwrapping and error normalization
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh on 401 if refresh token exists and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login/') &&
      !originalRequest.url?.includes('/auth/register/') &&
      !originalRequest.url?.includes('/auth/token/refresh/')
    ) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        originalRequest._retry = true;
        try {
          const refreshRes = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = refreshRes.data?.data?.access || refreshRes.data?.access;
          if (newAccessToken) {
            setAuthTokens(newAccessToken, refreshToken, true);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          clearAuthTokens();
        }
      }
    }

    // Extract user-friendly error messages from DRF response
    const resData = error.response?.data;
    let message = 'An error occurred. Please try again.';
    let fieldErrors = {};

    if (resData) {
      if (typeof resData === 'string') {
        message = resData;
      } else if (resData.message) {
        message = resData.message;
        if (resData.errors && typeof resData.errors === 'object') {
          fieldErrors = resData.errors;
        }
      } else if (resData.detail) {
        message = resData.detail;
      } else if (resData.errors && typeof resData.errors === 'object') {
        fieldErrors = resData.errors;
        const firstKey = Object.keys(fieldErrors)[0];
        if (firstKey) {
          const val = fieldErrors[firstKey];
          message = Array.isArray(val) ? `${firstKey}: ${val[0]}` : `${firstKey}: ${val}`;
        }
      } else if (typeof resData === 'object') {
        fieldErrors = resData;
        const firstKey = Object.keys(resData)[0];
        if (firstKey) {
          const val = resData[firstKey];
          message = Array.isArray(val) ? val[0] : `${firstKey}: ${val}`;
        }
      }
    } else if (error.message) {
      if (error.message.includes('Network Error')) {
        message = 'Unable to connect to the server. Please check your internet connection.';
      } else {
        message = error.message;
      }
    }

    const enhancedError = new Error(message);
    enhancedError.response = error.response;
    enhancedError.status = error.response?.status;
    enhancedError.customMessage = message;
    enhancedError.fieldErrors = fieldErrors;

    return Promise.reject(enhancedError);
  }
);

export default api;
