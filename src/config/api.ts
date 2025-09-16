// API Configuration
export const API_CONFIG = {
  // Base URL for the backend API
  BASE_URL: 'http://localhost:3000/api',
  
  // Timeout for API requests (in milliseconds)
  TIMEOUT: 10000,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Environment-specific configurations
export const getApiConfig = () => {
  // Use deployed backend for both development and production
  return {
    ...API_CONFIG,
    BASE_URL: 'https://backend-5f5u.onrender.com/api',
  };
};

// Helper function to get the full API URL
export const getApiUrl = (endpoint: string) => {
  const config = getApiConfig();
  return `${config.BASE_URL}${endpoint}`;
};
