/**
 * src/components/layout/Navbar.jsx — Top Navigation Bar
 */
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { CheckSquare, LayoutDashboard, ClipboardList, LogOut, User } from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', icon: ClipboardList },
];

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-40 border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                        <CheckSquare size={16} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">TaskFlow</span>
                    <span className="text-violet-400 font-bold text-lg tracking-tight">AI</span>
                </Link>

                {/* Navigation links */}
                <div className="hidden sm:flex items-center gap-1">
                    {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === to
                                    ? 'text-violet-400 bg-violet-500/10'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                                }`}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    ))}
                </div>

                {/* User menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800/60 transition-colors"
                    >
                        <div className="w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="hidden sm:block text-sm">{user?.name}</span>
                    </button>

                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-20 overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-800">
                                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400
                             hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;