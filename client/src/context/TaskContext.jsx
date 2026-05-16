/**
 * src/context/TaskContext.jsx — Task State Manager
 *
 * Global state for tasks with optimistic updates.
 *
 * MENTOR NOTE: "Optimistic updates" = update the UI immediately,
 * then sync with the server in the background. If the server fails,
 * roll back the UI change. This makes the app feel instant.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { taskApi, aiApi } from '../api/services.js';
import toast from 'react-hot-toast';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [filters, setFilters] = useState({
        status: '', priority: '', category: '', search: '',
        sortBy: 'createdAt', sortOrder: 'desc',
    });

    // ─── Fetch Tasks ─────────────────────────────────────────────────────────
    const fetchTasks = useCallback(async (overrideFilters = {}) => {
        setIsLoading(true);
        try {
            const params = { ...filters, ...overrideFilters };
            // Remove empty filter values from query string
            Object.keys(params).forEach(k => !params[k] && delete params[k]);
            const { data } = await taskApi.getTasks(params);
            setTasks(data.tasks);
            setPagination({ page: data.page, pages: data.pages, total: data.total });
        } catch (err) {
            toast.error(err.message || 'Failed to load tasks');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await taskApi.getStats();
            setStats(data);
        } catch {
            // Stats failure is non-critical, don't show error toast
        }
    }, []);

    // ─── Create Task ─────────────────────────────────────────────────────────
    const createTask = async (taskData) => {
        const { data } = await taskApi.createTask(taskData);
        // Add to top of list (optimistic-ish — we use server response)
        setTasks(prev => [data.task, ...prev]);
        toast.success('Task created! ✅');
        fetchStats(); // Refresh stats
        return data.task;
    };

    // ─── Update Task ─────────────────────────────────────────────────────────
    const updateTask = async (id, updates) => {
        // Optimistic update
        const original = tasks.find(t => t._id === id);
        setTasks(prev => prev.map(t => t._id === id ? { ...t, ...updates } : t));

        try {
            const { data } = await taskApi.updateTask(id, updates);
            setTasks(prev => prev.map(t => t._id === id ? data.task : t));
            fetchStats();
            return data.task;
        } catch (err) {
            // Roll back optimistic update
            setTasks(prev => prev.map(t => t._id === id ? original : t));
            toast.error(err.message || 'Failed to update task');
            throw err;
        }
    };

    // ─── Delete Task ─────────────────────────────────────────────────────────
    const deleteTask = async (id) => {
        const original = [...tasks];
        // Optimistic removal
        setTasks(prev => prev.filter(t => t._id !== id));

        try {
            await taskApi.deleteTask(id);
            toast.success('Task deleted');
            fetchStats();
        } catch (err) {
            setTasks(original); // Roll back
            toast.error(err.message || 'Failed to delete task');
            throw err;
        }
    };

    // ─── Toggle Complete ─────────────────────────────────────────────────────
    const toggleTask = async (id) => {
        const original = tasks.find(t => t._id === id);
        // Optimistic toggle
        setTasks(prev =>
            prev.map(t => t._id === id ? { ...t, completed: !t.completed } : t)
        );

        try {
            const { data } = await taskApi.toggleTask(id);
            setTasks(prev => prev.map(t => t._id === id ? data.task : t));
            fetchStats();
        } catch (err) {
            setTasks(prev => prev.map(t => t._id === id ? original : t));
            toast.error(err.message || 'Failed to update task');
        }
    };

    // ─── AI Suggestions ──────────────────────────────────────────────────────
    const getAISuggestions = async (description) => {
        const { data } = await aiApi.getSuggestions(description);
        return data.suggestions;
    };

    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    return (
        <TaskContext.Provider value={{
            tasks, stats, isLoading, pagination, filters,
            fetchTasks, fetchStats, createTask, updateTask,
            deleteTask, toggleTask, getAISuggestions, updateFilters,
        }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) throw new Error('useTasks must be used within a TaskProvider');
    return context;
};