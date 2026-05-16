/**
 * src/components/tasks/TaskForm.jsx — Create/Edit Task Modal with AI Panel
 *
 * The AI magic happens here:
 *  1. User types task description
 *  2. Clicks "Get AI Suggestions"
 *  3. Claude analyzes and returns structured suggestions
 *  4. User can apply all suggestions with one click
 *  5. Form fields auto-fill with AI suggestions
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '../../context/TaskContext.jsx';
import { PRIORITIES, CATEGORIES, STATUSES } from '../../utils/constants.js';
import { toInputDate } from '../../utils/constants.js';
import {
    X, Sparkles, Loader2, CheckCheck, Wand2,
    ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TaskForm = ({ task, onClose }) => {
    const { createTask, updateTask, getAISuggestions } = useTasks();
    const isEditing = Boolean(task);

    const [form, setForm] = useState({
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'medium',
        category: task?.category || 'other',
        status: task?.status || 'todo',
        deadline: task?.deadline ? toInputDate(task.deadline) : '',
        estimatedHours: task?.estimatedHours || '',
        tags: task?.tags?.join(', ') || '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState(null);
    const [suggestionsApplied, setSuggestionsApplied] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // ─── Get AI Suggestions ────────────────────────────────────────────────
    const handleGetSuggestions = async () => {
        if (!form.title.trim()) {
            toast.error('Enter a task description first');
            return;
        }

        setAiLoading(true);
        setSuggestionsApplied(false);
        try {
            const suggestions = await getAISuggestions(form.title);
            setAiSuggestions(suggestions);
        } catch (err) {
            toast.error(err.message || 'AI suggestions failed');
        } finally {
            setAiLoading(false);
        }
    };

    // ─── Apply AI Suggestions to form ─────────────────────────────────────
    const handleApplySuggestions = () => {
        if (!aiSuggestions) return;

        setForm(prev => ({
            ...prev,
            priority: aiSuggestions.priority || prev.priority,
            category: aiSuggestions.category || prev.category,
            estimatedHours: aiSuggestions.estimatedHours || prev.estimatedHours,
            deadline: aiSuggestions.suggestedDeadline
                ? toInputDate(new Date(aiSuggestions.suggestedDeadline))
                : prev.deadline,
        }));

        setSuggestionsApplied(true);
        toast.success('AI suggestions applied! ✨');
    };

    // ─── Submit form ──────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                priority: form.priority,
                category: form.category,
                status: form.status,
                deadline: form.deadline || null,
                estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : null,
                tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                // Track if AI suggestions were used
                ...(aiSuggestions && {
                    aiSuggestions: {
                        ...aiSuggestions,
                        appliedByUser: suggestionsApplied,
                    },
                }),
            };

            if (isEditing) {
                await updateTask(task._id, payload);
                toast.success('Task updated!');
            } else {
                await createTask(payload);
            }

            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to save task');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl
                   max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-lg font-bold text-white">
                        {isEditing ? 'Edit Task' : 'New Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                       hover:text-white hover:bg-gray-800 transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Task Title / Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Task Description <span className="text-red-400">*</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder='e.g. "Finish IEEE paper before next Friday"'
                                required
                                className="flex-1 bg-gray-800/60 border border-gray-700/60 text-white rounded-xl px-4 py-2.5 text-sm
                           placeholder-gray-500 focus:outline-none focus:border-violet-500/60
                           focus:ring-1 focus:ring-violet-500/20 transition-all"
                            />
                            {/* AI button */}
                            <button
                                type="button"
                                onClick={handleGetSuggestions}
                                disabled={aiLoading}
                                title="Get AI Suggestions"
                                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-violet-600/20 border
                           border-violet-600/40 hover:bg-violet-600/30 text-violet-300 rounded-xl
                           text-xs font-medium transition-all disabled:opacity-50"
                            >
                                {aiLoading
                                    ? <Loader2 size={14} className="animate-spin" />
                                    : <Wand2 size={14} />
                                }
                                AI
                            </button>
                        </div>
                    </div>

                    {/* AI Suggestions Panel */}
                    {aiSuggestions && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-violet-900/20 border border-violet-700/40 rounded-xl p-4"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={16} className="text-violet-400" />
                                    <span className="text-sm font-semibold text-violet-300">AI Suggestions</span>
                                </div>
                                {!suggestionsApplied ? (
                                    <button
                                        type="button"
                                        onClick={handleApplySuggestions}
                                        className="flex items-center gap-1 text-xs bg-violet-600 hover:bg-violet-500
                               text-white px-2.5 py-1 rounded-lg transition-all font-medium"
                                    >
                                        <CheckCheck size={12} />
                                        Apply All
                                    </button>
                                ) : (
                                    <span className="text-xs text-green-400 font-medium">✓ Applied</span>
                                )}
                            </div>

                            {/* Suggestion chips */}
                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                <div className="bg-gray-800/60 rounded-lg p-2">
                                    <span className="text-gray-400">Priority: </span>
                                    <span className="text-white capitalize font-medium">{aiSuggestions.priority}</span>
                                </div>
                                <div className="bg-gray-800/60 rounded-lg p-2">
                                    <span className="text-gray-400">Category: </span>
                                    <span className="text-white capitalize font-medium">{aiSuggestions.category}</span>
                                </div>
                                {aiSuggestions.estimatedHours && (
                                    <div className="bg-gray-800/60 rounded-lg p-2">
                                        <span className="text-gray-400">Effort: </span>
                                        <span className="text-white font-medium">{aiSuggestions.estimatedHours}h</span>
                                    </div>
                                )}
                                {aiSuggestions.suggestedDeadline && (
                                    <div className="bg-gray-800/60 rounded-lg p-2">
                                        <span className="text-gray-400">Deadline: </span>
                                        <span className="text-white font-medium">
                                            {new Date(aiSuggestions.suggestedDeadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Reasoning */}
                            {aiSuggestions.reasoning && (
                                <p className="text-xs text-gray-400 italic">{aiSuggestions.reasoning}</p>
                            )}

                            {/* Subtasks */}
                            {aiSuggestions.subtasks?.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs text-gray-400 mb-1">Suggested breakdown:</p>
                                    <ul className="space-y-0.5">
                                        {aiSuggestions.subtasks.map((s, i) => (
                                            <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                                                <span className="text-violet-400 mt-0.5">•</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Notes / Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Notes</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Add more details..."
                            rows={2}
                            className="w-full bg-gray-800/60 border border-gray-700/60 text-white rounded-xl px-4 py-2.5 text-sm
                         placeholder-gray-500 focus:outline-none focus:border-violet-500/60
                         focus:ring-1 focus:ring-violet-500/20 transition-all resize-none"
                        />
                    </div>

                    {/* Priority + Category row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Priority</label>
                            <select
                                name="priority"
                                value={form.priority}
                                onChange={handleChange}
                                className="w-full bg-gray-800/60 border border-gray-700/60 text-white rounded-xl px-3 py-2.5 text-sm
                           focus:outline-none focus:border-violet-500/60 transition-all appearance-none"
                            >
                                {PRIORITIES.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full bg-gray-800/60 border border-gray-700/60 text-white rounded-xl px-3 py-2.5 text-sm
                           focus:outline-none focus:border-violet-500/60 transition-all appearance-none"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Deadline + Effort row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Deadline</label>
                            <input
                                name="deadline"
                                type="date"
                                value={form.deadline}
                                onChange={handleChange}
                                className="w-full bg-gray-800/60 border border-gray-700/60 text-white rounded-xl px-3 py-2.5 text-sm
                           focus:outline-none focus:border-violet-500/60 transition-all
                           [color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Est. Hours</label>
                            <input
                                name="estimatedHours"
                                type="number"
                                step="0.5"
                                min="0"
                                value={form.estimatedHours}
                                onChange={handleChange}
                                placeholder="e.g. 2.5"
                                className="w-full bg-gray-800/60 border border-gray-700/60 text-white rounded-xl px-3 py-2.5 text-sm
                           placeholder-gray-500 focus:outline-none focus:border-violet-500/60 transition-all"
                            />
                        </div>
                    </div>

                    {/* Status (editing only) */}
                    {isEditing && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full bg-gray-800/60 border border-gray-700/60 text-white rounded-xl px-3 py-2.5 text-sm
                           focus:outline-none focus:border-violet-500/60 transition-all appearance-none"
                            >
                                {STATUSES.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Tags <span className="text-gray-500 font-normal">(comma separated)</span>
                        </label>
                        <input
                            name="tags"
                            value={form.tags}
                            onChange={handleChange}
                            placeholder="research, urgent, review"
                            className="w-full bg-gray-800/60 border border-gray-700/60 text-white rounded-xl px-4 py-2.5 text-sm
                         placeholder-gray-500 focus:outline-none focus:border-violet-500/60
                         focus:ring-1 focus:ring-violet-500/20 transition-all"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300
                         hover:bg-gray-800 transition-all text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800
                         text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <><Loader2 size={16} className="animate-spin" /> Saving...</>
                            ) : (
                                isEditing ? 'Save Changes' : 'Create Task'
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default TaskForm;