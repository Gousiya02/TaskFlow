/**
 * src/components/tasks/TaskFilters.jsx — Filter/Sort Controls
 */
import { useTasks } from '../../context/TaskContext.jsx';
import { PRIORITIES, CATEGORIES, STATUSES } from '../../utils/constants.js';

const TaskFilters = () => {
    const { filters, updateFilters } = useTasks();

    const handleChange = (key, value) => {
        updateFilters({ [key]: value });
    };

    const clearFilters = () => {
        updateFilters({ status: '', priority: '', category: '', sortBy: 'createdAt', sortOrder: 'desc' });
    };

    const hasActiveFilters = filters.status || filters.priority || filters.category;

    return (
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Status */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-2 py-1.5 text-xs
                       focus:outline-none focus:border-violet-500/60 appearance-none"
                    >
                        <option value="">All</option>
                        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>

                {/* Priority */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Priority</label>
                    <select
                        value={filters.priority}
                        onChange={(e) => handleChange('priority', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-2 py-1.5 text-xs
                       focus:outline-none focus:border-violet-500/60 appearance-none"
                    >
                        <option value="">All</option>
                        {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Category</label>
                    <select
                        value={filters.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-2 py-1.5 text-xs
                       focus:outline-none focus:border-violet-500/60 appearance-none"
                    >
                        <option value="">All</option>
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                    </select>
                </div>

                {/* Sort */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Sort by</label>
                    <select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onChange={(e) => {
                            const [sortBy, sortOrder] = e.target.value.split('-');
                            updateFilters({ sortBy, sortOrder });
                        }}
                        className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-2 py-1.5 text-xs
                       focus:outline-none focus:border-violet-500/60 appearance-none"
                    >
                        <option value="createdAt-desc">Newest first</option>
                        <option value="createdAt-asc">Oldest first</option>
                        <option value="deadline-asc">Deadline (soonest)</option>
                        <option value="priority-desc">Priority (highest)</option>
                    </select>
                </div>
            </div>

            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                    ✕ Clear filters
                </button>
            )}
        </div>
    );
};

export default TaskFilters;