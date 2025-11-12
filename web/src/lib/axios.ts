import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { useAuthStore } from '../store/authStore';

/**
 * Axios Instance Configuration
 * 
 * Configured with base URL, interceptors for JWT authentication,
 * and error handling.
 */

// Create axios instance with dynamic baseURL that's evaluated at runtime
const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl, // Initial value, will be overridden on each request
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Update baseURL and add JWT token on every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Update baseURL on every request to ensure it's always current (runtime evaluation)
    const apiUrl = env.apiUrl;
    config.baseURL = apiUrl;
    
    // DEBUG: Log the API URL being used
    console.log('[Axios] Request to:', apiUrl + (config.url || ''));
    console.log('[Axios] Full URL:', config.baseURL + (config.url || ''));
    
    // Add JWT token to requests
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized or 403 Forbidden - Token expired or invalid
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${env.apiUrl}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Update both localStorage and auth store
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          // Update auth store with new tokens
          const authStore = useAuthStore.getState();
          if (authStore.isAuthenticated) {
            useAuthStore.setState({
              accessToken,
              refreshToken: newRefreshToken || authStore.refreshToken,
            });
          }
          
          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear tokens and auth store, then redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          useAuthStore.getState().clearAuth();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token - clear auth store and redirect to login
        localStorage.removeItem('accessToken');
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

