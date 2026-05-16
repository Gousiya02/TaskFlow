/**
 * src/routes/ProtectedRoute.jsx — JWT Route Guard
 *
 * Wraps private pages. If not authenticated, redirects to /login.
 * While auth state is loading, shows a spinner (prevents flash).
 *
 * MENTOR NOTE: The `replace` prop on <Navigate> replaces the current
 * history entry so the user can't click "back" to get to a protected page.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth status
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Loading TaskFlow...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Save the attempted URL so we can redirect after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;