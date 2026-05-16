/**
 * src/context/AuthContext.jsx — Authentication State Manager
 *
 * Provides:
 *  - user state (null when logged out)
 *  - login/register/logout functions
 *  - loading state (for initial token validation)
 *  - Persistent login via localStorage
 *
 * MENTOR NOTE: On app load, we check localStorage for a saved token
 * and validate it against the server. This gives "stay logged in" UX.
 * The `isLoading` state prevents the login page from flashing before
 * we know if the user is authenticated.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/services.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // True until initial auth check

    // ─── Persist user data ──────────────────────────────────────────────────
    const saveAuthData = (token, userData) => {
        localStorage.setItem('taskflow_token', token);
        localStorage.setItem('taskflow_user', JSON.stringify(userData));
        setUser(userData);
    };

    const clearAuthData = useCallback(() => {
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
        setUser(null);
    }, []);

    // ─── On mount: validate saved token ────────────────────────────────────
    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('taskflow_token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                // Verify token is still valid with server
                const { data } = await authApi.getMe();
                setUser(data.user);
            } catch {
                // Token invalid or expired — clear it silently
                clearAuthData();
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, [clearAuthData]);

    // ─── Listen for forced logout (from axios interceptor) ─────────────────
    useEffect(() => {
        const handleForceLogout = () => {
            clearAuthData();
            toast.error('Session expired. Please login again.');
        };

        window.addEventListener('auth:logout', handleForceLogout);
        return () => window.removeEventListener('auth:logout', handleForceLogout);
    }, [clearAuthData]);

    // ─── Auth Actions ───────────────────────────────────────────────────────
    const login = async (email, password) => {
        const { data } = await authApi.login({ email, password });
        saveAuthData(data.token, data.user);
        toast.success(`Welcome back, ${data.user.name}! 👋`);
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await authApi.register({ name, email, password });
        saveAuthData(data.token, data.user);
        toast.success(`Account created! Welcome to TaskFlow, ${data.user.name}! 🎉`);
        return data;
    };

    const logout = () => {
        clearAuthData();
        toast.success('Logged out successfully');
    };

    const updateUser = (updates) => {
        const updated = { ...user, ...updates };
        setUser(updated);
        localStorage.setItem('taskflow_user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for clean consumption
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};