import axios from 'axios';

// Get base URL from environment variables (created by Vite)
// If VITE_API_URL is defined (e.g., in .env.production), use it.
// Otherwise, fall back to relative paths (works with proxy or same-origin serving).
let baseURL = import.meta.env.VITE_API_URL;

if (baseURL) {
    if (!baseURL.startsWith('http')) {
        baseURL = `https://${baseURL}`;
    }
    // Remove trailing slash to avoid double slashes in paths
    baseURL = baseURL.replace(/\/$/, '');
    axios.defaults.baseURL = baseURL;
    console.log('🚀 API Base URL:', baseURL);
} else {
    if (import.meta.env.PROD) {
        console.warn('⚠️ VITE_API_URL is missing in Production environment!');
    }
}

// Global interceptor to help debug connection issues
axios.interceptors.response.use(
    response => response,
    error => {
        if (!error.response && import.meta.env.PROD) {
            console.error('Network Error: Could not reach backend. Verify VITE_API_URL and CORS settings. Current URL:', axios.defaults.baseURL);
        }
        return Promise.reject(error);
    }
);

// Global defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

export default axios;
