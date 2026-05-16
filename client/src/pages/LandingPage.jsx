/**
 * src/pages/LandingPage.jsx
 *
 * Modern AI SaaS landing page for TaskFlow AI
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    Brain,
    LayoutDashboard,
    Clock3,
    Sparkles,
    CheckSquare,
} from 'lucide-react';

const features = [
    {
        icon: Brain,
        title: 'AI-Powered Suggestions',
        description:
            'Automatically get smart priority levels, categories, and deadlines using AI.',
    },
    {
        icon: LayoutDashboard,
        title: 'Productivity Dashboard',
        description:
            'Track completed tasks, progress, and weekly productivity insights.',
    },
    {
        icon: Clock3,
        title: 'Smart Task Management',
        description:
            'Organize, filter, and manage your tasks efficiently in one place.',
    },
];

function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl" />
            </div>

            {/* Navbar */}
            <header className="relative z-10 border-b border-gray-800/60 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
                            <CheckSquare size={20} />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight">
                            TaskFlow AI
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-gray-300 hover:text-white transition-colors"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="bg-violet-600 hover:bg-violet-500 px-5 py-2.5 rounded-xl font-medium transition-all"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
                <div className="grid lg:grid-cols-2 gap-14 items-center">
                    {/* Left */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 text-sm text-violet-300 mb-6">
                            <Sparkles size={16} />
                            AI-Powered Productivity
                        </div>

                        <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight mb-6">
                            Manage Tasks <br />
                            Smarter with <span className="text-violet-400">AI</span>
                        </h1>

                        <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-xl">
                            TaskFlow AI helps you organize tasks, predict priorities,
                            suggest deadlines, and boost productivity using artificial
                            intelligence.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/register"
                                className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                            >
                                Start Free
                                <ArrowRight size={18} />
                            </Link>

                            <Link
                                to="/login"
                                className="border border-gray-700 hover:border-gray-500 px-6 py-3 rounded-xl font-semibold transition-all"
                            >
                                Sign In
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-6 mt-12">
                            <div>
                                <h3 className="text-3xl font-bold">10K+</h3>
                                <p className="text-gray-500 text-sm">
                                    Tasks Managed
                                </p>
                            </div>

                            <div>
                                <h3 className="text-3xl font-bold">98%</h3>
                                <p className="text-gray-500 text-sm">
                                    Productivity Boost
                                </p>
                            </div>

                            <div>
                                <h3 className="text-3xl font-bold">AI</h3>
                                <p className="text-gray-500 text-sm">
                                    Smart Suggestions
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                    >
                        <div className="bg-gray-900/80 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
                            {/* Mock Dashboard */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-bold text-lg">
                                    Today's Tasks
                                </h2>

                                <div className="bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full text-xs">
                                    AI Active
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    'Finish startup dashboard UI',
                                    'Prepare IEEE ML presentation',
                                    'Deploy backend to Render',
                                ].map((task, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-gray-800/70 border border-gray-700 rounded-2xl p-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle2
                                                    className="text-violet-400 mt-1"
                                                    size={18}
                                                />

                                                <div>
                                                    <p className="font-medium">
                                                        {task}
                                                    </p>

                                                    <p className="text-sm text-gray-400 mt-1">
                                                        AI Priority: High
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-1 rounded-lg">
                                                Important
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
                <div className="text-center mb-14">
                    <h2 className="text-4xl font-bold mb-4">
                        Everything you need to stay productive
                    </h2>

                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Built for developers, students, and startup teams who
                        want AI-assisted task management.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-gray-900/70 border border-gray-800 rounded-3xl p-8"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-violet-600/20 flex items-center justify-center mb-5">
                                    <Icon className="text-violet-400" size={26} />
                                </div>

                                <h3 className="text-xl font-bold mb-3">
                                    {feature.title}
                                </h3>

                                <p className="text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

export default LandingPage;