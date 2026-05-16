/**
 * src/utils/constants.js — App-wide Constants
 */

export const PRIORITIES = [
    { value: 'urgent', label: 'Urgent', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40', dot: 'bg-red-400' },
    { value: 'high', label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/40', dot: 'bg-orange-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', dot: 'bg-yellow-400' },
    { value: 'low', label: 'Low', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/40', dot: 'bg-green-400' },
];

export const CATEGORIES = [
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'personal', label: 'Personal', icon: '🏠' },
    { value: 'health', label: 'Health', icon: '💪' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'finance', label: 'Finance', icon: '💰' },
    { value: 'other', label: 'Other', icon: '📌' },
];

export const STATUSES = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
];

export const getPriority = (value) =>
    PRIORITIES.find(p => p.value === value) || PRIORITIES[2];

export const getCategory = (value) =>
    CATEGORIES.find(c => c.value === value) || CATEGORIES[5];


/**
 * src/utils/dateUtils.js — Date formatting helpers
 */
import { format, formatDistanceToNow, isPast, isToday, isTomorrow, parseISO } from 'date-fns';

export const formatDate = (date) => {
    if (!date) return null;
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'MMM d, yyyy');
};

export const formatRelative = (date) => {
    if (!date) return null;
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
};

export const isOverdue = (date) => {
    if (!date) return false;
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isPast(d) && !isToday(d);
};

export const toInputDate = (date) => {
    if (!date) return '';
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'yyyy-MM-dd');
};