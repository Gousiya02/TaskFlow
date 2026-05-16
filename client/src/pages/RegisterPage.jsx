/**
 * src/pages/RegisterPage.jsx
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, CheckSquare, ArrowRight, Check } from 'lucide-react';

const passwordRequirements = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'Contains a number', test: (p) => /\d/.test(p) },
];

const RegisterPage = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        try {
            await register(form.name, form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md relative"
            >
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
                        <CheckSquare size={20} className="text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tight">TaskFlow AI</span>
                </div>

                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/60 rounded-2xl p-8 shadow-2xl">
                    <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
                    <p className="text-gray-400 text-sm mb-6">Start managing tasks intelligently</p>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Jane Smith"
                                required
                                className="w-full bg-gray-800/60 border border-gray-700/60 text-white rounded-xl px-4 py-3 text-sm
                           placeholder-gray-500 focus:outline-none focus:border-violet-500/70 focus:ring-1
                           focus:ring-violet-500/30 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                className="w-full bg-gray-800/60 border border-gray-700/60 text-white rounded-xl px-4 py-3 text-sm
                           placeholder-gray-500 focus:outline-none focus:border-violet-500/70 focus:ring-1
                           focus:ring-violet-500/30 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Min. 8 characters"
                                    required
                                    className="w-full bg-gray-800/60 border border-gray-700/60 text-white rounded-xl px-4 py-3 pr-12 text-sm
                             placeholder-gray-500 focus:outline-none focus:border-violet-500/70 focus:ring-1
                             focus:ring-violet-500/30 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Password requirements */}
                            {form.password.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {passwordRequirements.map((req) => (
                                        <div key={req.label} className="flex items-center gap-1.5">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${req.test(form.password) ? 'bg-green-500' : 'bg-gray-700'
                                                }`}>
                                                {req.test(form.password) && <Check size={10} className="text-white" />}
                                            </div>
                                            <span className={`text-xs transition-colors ${req.test(form.password) ? 'text-green-400' : 'text-gray-500'
                                                }`}>{req.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed
                         text-white font-semibold py-3 rounded-xl transition-all duration-200
                         flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;