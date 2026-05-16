/**
 * src/pages/TasksPage.jsx — Main Task Management Page
 *
 * The heart of the app. Features:
 *  - Task list with filter/search
 *  - Create/Edit task modal with AI suggestions
 *  - Real-time toggle complete
 *  - Delete with confirmation
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../context/TaskContext.jsx';
import Layout from '../components/layout/Layout.jsx';
import TaskCard from '../components/tasks/TaskCard.jsx';
import TaskForm from '../components/tasks/TaskForm.jsx';
import TaskFilters from '../components/tasks/TaskFilters.jsx';
import {
    Plus, Search, SlidersHorizontal, Loader2,
    ClipboardList, Sparkles,
} from 'lucide-react';

const TasksPage = () => {
    const { tasks, isLoading, fetchTasks, filters, updateFilters } = useTasks();
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Fetch on mount and filter change
    useEffect(() => {
        fetchTasks();
    }, [filters, fetchTasks]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters({ search });
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleEdit = useCallback((task) => {
        setEditingTask(task);
        setShowForm(true);
    }, []);

    const handleCloseForm = useCallback(() => {
        setShowForm(false);
        setEditingTask(null);
    }, []);

    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <ClipboardList size={24} className="text-violet-400" />
                            My Tasks
                        </h1>
                        <p className="text-gray-400 text-sm mt-0.5">
                            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white
                       font-semibold px-4 py-2.5 rounded-xl transition-all text-sm"
                    >
                        <Plus size={18} />
                        New Task
                    </motion.button>
                </div>

                {/* AI Feature Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-3 bg-violet-900/20 border border-violet-800/40 rounded-xl
                     flex items-center gap-3 text-sm"
                >
                    <div className="w-8 h-8 bg-violet-600/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles size={16} className="text-violet-400" />
                    </div>
                    <p className="text-gray-300">
                        <span className="text-violet-400 font-medium">AI-powered:</span>{' '}
                        When creating a task, describe it naturally and Claude will suggest priority, deadline, category, and effort.
                    </p>
                </motion.div>

                {/* Search + Filters */}
                <div className="flex gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search tasks..."
                            className="w-full bg-gray-900/60 border border-gray-800/60 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm
                         placeholder-gray-500 focus:outline-none focus:border-violet-500/60 focus:ring-1
                         focus:ring-violet-500/20 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${showFilters
                                ? 'bg-violet-600/20 border-violet-600/40 text-violet-300'
                                : 'bg-gray-900/60 border-gray-800/60 text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <SlidersHorizontal size={16} />
                        Filters
                    </button>
                </div>

                {/* Expandable filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mb-4"
                        >
                            <TaskFilters />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Task List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-violet-500" />
                    </div>
                ) : tasks.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ClipboardList size={32} className="text-gray-600" />
                        </div>
                        <h3 className="text-gray-300 font-semibold mb-1">No tasks found</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            {filters.search ? 'Try a different search term' : 'Create your first task to get started'}
                        </p>
                        {!filters.search && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500
                           text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all"
                            >
                                <Plus size={16} />
                                Create Task
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence initial={false}>
                            {tasks.map((task, idx) => (
                                <TaskCard
                                    key={task._id}
                                    task={task}
                                    index={idx}
                                    onEdit={handleEdit}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Task Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <TaskForm
                        task={editingTask}
                        onClose={handleCloseForm}
                    />
                )}
            </AnimatePresence>
        </Layout>
    );
};

export default TasksPage;