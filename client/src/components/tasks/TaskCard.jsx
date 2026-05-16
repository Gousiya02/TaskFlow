/**
 * src/components/tasks/TaskCard.jsx — Individual Task Card
 *
 * Displays task info with:
 *  - Priority color coding
 *  - Deadline with overdue detection
 *  - Complete toggle
 *  - Edit + Delete actions
 *  - Smooth entrance animation
 */
import { motion } from 'framer-motion';
import { useTasks } from '../../context/TaskContext.jsx';
import { getPriority, getCategory } from '../../utils/constants.js';
import { formatDate, isOverdue } from '../../utils/constants.js';
import {
    Check, Edit2, Trash2, Calendar, Clock,
    AlertCircle,
} from 'lucide-react';
import { useState } from 'react';

const TaskCard = ({ task, index, onEdit }) => {
    const { toggleTask, deleteTask } = useTasks();
    const [isDeleting, setIsDeleting] = useState(false);

    const priority = getPriority(task.priority);
    const category = getCategory(task.category);
    const overdue = !task.completed && isOverdue(task.deadline);

    const handleDelete = async () => {
        if (!window.confirm('Delete this task?')) return;
        setIsDeleting(true);
        try {
            await deleteTask(task._id);
        } catch {
            setIsDeleting(false);
        }
    };

    // Format deadline for display
    const deadlineStr = task.deadline ? formatDate(task.deadline) : null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, scale: 0.97 }}
            transition={{ delay: index * 0.03 }}
            className={`group bg-gray-900/60 border rounded-xl p-4 backdrop-blur-sm transition-all
                  hover:border-gray-700/80 ${task.completed
                    ? 'border-gray-800/40 opacity-60'
                    : overdue
                        ? 'border-red-800/40'
                        : 'border-gray-800/60'
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Complete toggle button */}
                <button
                    onClick={() => toggleTask(task._id)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center
                      justify-center transition-all ${task.completed
                            ? 'bg-violet-600 border-violet-600'
                            : 'border-gray-600 hover:border-violet-400'
                        }`}
                >
                    {task.completed && <Check size={10} className="text-white" strokeWidth={3} />}
                </button>

                {/* Task content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-medium text-sm leading-tight ${task.completed ? 'line-through text-gray-500' : 'text-white'
                            }`}>
                            {task.title}
                        </h3>

                        {/* Actions — visible on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button
                                onClick={() => onEdit(task)}
                                className="p-1.5 text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
                            >
                                <Edit2 size={13} />
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    {task.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {/* Priority badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                             border ${priority.bg} ${priority.color} ${priority.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                            {priority.label}
                        </span>

                        {/* Category */}
                        <span className="text-xs text-gray-500">
                            {category.icon} {category.label}
                        </span>

                        {/* Deadline */}
                        {deadlineStr && (
                            <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-400' : 'text-gray-500'
                                }`}>
                                {overdue ? <AlertCircle size={11} /> : <Calendar size={11} />}
                                {deadlineStr}
                                {overdue && ' (overdue)'}
                            </span>
                        )}

                        {/* Effort estimate */}
                        {task.estimatedHours && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock size={11} />
                                {task.estimatedHours}h
                            </span>
                        )}
                    </div>

                    {/* AI suggestion badge */}
                    {task.aiSuggestions?.appliedByUser && (
                        <span className="inline-flex items-center gap-1 mt-2 text-xs text-violet-400">
                            ✨ AI assisted
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default TaskCard;