/**
 * src/api/axios.js — Configured Axios Instance
 *
 * Central HTTP client for all API calls. Handles:
 *  - Base URL from environment variables
 *  - Automatic JWT injection on every request
 *  - Token expiry detection + auto-logout
 *  - Consistent error formatting
 *
 * MENTOR NOTE: Interceptors are the key pattern here. Instead of adding
 * Authorization headers in every API call, we do it ONCE here.
 */

import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 15000, // 15 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Request Interceptor: Inject JWT ──────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('taskflow_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle Errors ─────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Token expired or invalid — clear storage and redirect to login
        if (error.response?.status === 401) {
            const message = error.response?.data?.message || '';
            if (message.includes('expired') || message.includes('Invalid token')) {
                localStorage.removeItem('taskflow_token');
                localStorage.removeItem('taskflow_user');
                // Dispatch custom event so AuthContext can react
                window.dispatchEvent(new CustomEvent('auth:logout'));
            }
        }

        // Normalize error message for consistent handling in components
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'An unexpected error occurred';

        return Promise.reject(new Error(errorMessage));
    }
);

export default api;