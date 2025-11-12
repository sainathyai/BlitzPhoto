/**
 * Environment Configuration
 * 
 * Centralized environment variables for the mobile application.
 */

import Constants from 'expo-constants';

export const env = {
  // API Configuration
  apiUrl: Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8080/api/v1',
  
  // Application Configuration
  appName: 'BlitzPhoto',
  appVersion: '1.0.0',
  
  // Upload Configuration
  upload: {
    maxFiles: 10000, // Effectively unlimited
    maxFileSize: 50 * 1024 * 1024, // 50MB in bytes
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/heic', 'image/webp'],
    multipartThreshold: 5 * 1024 * 1024, // 5MB in bytes
  },
} as const;

export default env;

