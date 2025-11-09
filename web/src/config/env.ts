/**
 * Environment Configuration
 * 
 * Centralized environment variables for the application.
 */

export const env = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  
  // Application Configuration
  appName: 'BlitzPhoto',
  appVersion: '1.0.0',
  
  // Feature Flags
  features: {
    enableWebSocket: import.meta.env.VITE_ENABLE_WEBSOCKET === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },
  
  // Upload Configuration
  upload: {
    maxFiles: 100,
    maxFileSize: 50 * 1024 * 1024, // 50MB in bytes
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/heic', 'image/webp'],
    multipartThreshold: 5 * 1024 * 1024, // 5MB in bytes
  },
} as const;

export default env;

