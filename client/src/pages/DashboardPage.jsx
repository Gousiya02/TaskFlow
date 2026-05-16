/**
 * src/pages/DashboardPage.jsx — Analytics & Stats Dashboard
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useTasks } from '../context/TaskContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Layout from '../components/layout/Layout.jsx';
import {
    CheckCircle2, Clock, AlertTriangle, TrendingUp, Plus,
    Zap, Calendar, Target,
} from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

const StatCard = ({ icon: Icon, label, value, sub, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6 backdrop-blur-sm"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
            {sub && <span className="text-xs text-gray-500">{sub}</span>}
        </div>
        <div className="text-3xl font-bold text-white mb-1">{value ?? '—'}</div>
        <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
);

const DashboardPage = () => {
    const { stats, fetchStats, isLoading } = useTasks();
    const { user } = useAuth();

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Format weekly data for bar chart
    const weeklyChartData = DAYS.map((day, i) => {
        const found = stats?.weeklyData?.find(d => d._id === i + 1);
        return { day, completed: found?.count || 0 };
    });

    // Format category data for pie chart
    const categoryData = stats?.categoryBreakdown?.map(c => ({
        name: c._id || 'other',
        value: c.count,
    })) || [];

    const s = stats?.stats;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-white">
                        Good day, <span className="text-violet-400">{user?.name?.split(' ')[0]}</span> 👋
                    </h1>
                    <p className="text-gray-400 mt-1">Here's your productivity overview</p>
                </motion.div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={Target} label="Total Tasks"
                        value={s?.total} color="bg-violet-600"
                        delay={0.05}
                    />
                    <StatCard
                        icon={CheckCircle2} label="Completed"
                        value={s?.completed} sub={s?.completionRate != null ? `${s.completionRate}%` : null}
                        color="bg-green-600" delay={0.1}
                    />
                    <StatCard
                        icon={Clock} label="In Progress"
                        value={s?.inProgress} color="bg-blue-600"
                        delay={0.15}
                    />
                    <StatCard
                        icon={AlertTriangle} label="Overdue"
                        value={s?.overdue} color="bg-red-600"
                        delay={0.2}
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Weekly bar chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="lg:col-span-2 bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp size={18} className="text-violet-400" />
                            <h2 className="text-white font-semibold">Weekly Completed Tasks</h2>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={weeklyChartData} barSize={28}>
                                <XAxis
                                    dataKey="day"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        background: '#111827',
                                        border: '1px solid rgba(139,92,246,0.3)',
                                        borderRadius: '8px',
                                        color: '#e2e8f0',
                                    }}
                                />
                                <Bar dataKey="completed" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Category pie chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <Calendar size={18} className="text-violet-400" />
                            <h2 className="text-white font-semibold">By Category</h2>
                        </div>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#111827',
                                            border: '1px solid rgba(139,92,246,0.3)',
                                            borderRadius: '8px',
                                            color: '#e2e8f0',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
                                No tasks yet
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Completion Rate + CTA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Progress bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6"
                    >
                        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Zap size={18} className="text-violet-400" />
                            Completion Rate
                        </h2>
                        <div className="text-5xl font-bold text-white mb-4">
                            {s?.completionRate ?? 0}
                            <span className="text-2xl text-gray-500">%</span>
                        </div>
                        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${s?.completionRate || 0}%` }}
                                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
                            />
                        </div>
                        <p className="text-gray-400 text-sm mt-2">
                            {s?.completed || 0} of {s?.total || 0} tasks completed
                        </p>
                    </motion.div>

                    {/* Quick actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-violet-900/40 to-indigo-900/40 border border-violet-800/40 rounded-2xl p-6"
                    >
                        <h2 className="text-white font-semibold mb-2">Ready to be productive?</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Create tasks with AI-powered suggestions for priority, deadlines, and effort estimation.
                        </p>
                        <Link
                            to="/tasks"
                            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white
                         font-semibold px-5 py-2.5 rounded-xl transition-all duration-200"
                        >
                            <Plus size={18} />
                            Add New Task
                        </Link>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

export default DashboardPage;