/**
 * Environment Configuration
 * 
 * Centralized environment variables for the application.
 */

// Get API URL - prioritize build-time env var, then runtime detection
function getApiUrl(): string {
  // RUNTIME DETECTION: In browser, check current location FIRST
  // This ensures we always use the correct URL based on where the app is running
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // DEBUG: Log what we're detecting
    console.log('[API URL] Runtime detection:', { hostname, protocol, fullUrl: window.location.href });
    
    // PRODUCTION: If we're on HTTPS or production domain, ALWAYS use production API
    // This covers: CloudFront (blitzphoto.sainathyai.com), S3 website, etc.
    if (protocol === 'https:' || hostname === 'blitzphoto.sainathyai.com' || hostname.includes('sainathyai') || hostname.includes('cloudfront')) {
      const url = 'https://blitzphoto.sainathyai.com/api/v1';
      console.log('[API URL] Using production HTTPS (runtime):', url);
      return url;
    }
    
    // LOCAL DEVELOPMENT: Only use localhost if we're actually running locally
    // Check for localhost, 127.0.0.1, or local IP addresses
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') || 
        hostname.startsWith('10.') ||
        hostname.startsWith('172.16.')) {
      const url = 'http://localhost:8080/api/v1';
      console.log('[API URL] Using localhost (runtime):', url);
      return url;
    }
  }
  
  // FALLBACK: Check for build-time environment variable
  if (import.meta.env.VITE_API_URL) {
    console.log('[API URL] Using VITE_API_URL from build:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // SAFE DEFAULT: Always default to production API (never localhost)
  // This ensures deployed frontend always uses production backend
  const url = 'https://blitzphoto.sainathyai.com/api/v1';
  console.log('[API URL] Using default (production):', url);
  return url;
}

export const env = {
      // API Configuration - evaluated at runtime, not build time
      // Use a function that's called each time to ensure fresh evaluation
      get apiUrl() {
        return getApiUrl();
      },
  
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

