import axios from 'axios';

// Get base URL from environment variables (created by Vite)
// If VITE_API_URL is defined (e.g., in .env.production), use it.
// Otherwise, fall back to relative paths (works with proxy or same-origin serving).
const baseURL = import.meta.env.VITE_API_URL;

if (baseURL) {
    axios.defaults.baseURL = baseURL;
} else {
    // Optional: Default to local server if you want to bypass proxy in dev
    // axios.defaults.baseURL = 'http://localhost:5000';
}

// Global defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

export default axios;
