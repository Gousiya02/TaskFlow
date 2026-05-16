/**
 * src/controllers/taskController.js — Task CRUD Controller
 *
 * All task operations. Every query is scoped to req.user._id
 * so users can NEVER access each other's tasks.
 *
 * Features:
 *  - Create, Read (list + single), Update, Delete
 *  - Filter by status, priority, category
 *  - Search by title/description (text search)
 *  - Sort by deadline, createdAt, priority
 *  - Pagination
 *  - Dashboard stats aggregation
 */

import Task from '../models/Task.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';

// ─── GET /api/tasks ───────────────────────────────────────────────────────
export const getTasks = asyncHandler(async (req, res) => {
    const {
        status,
        priority,
        category,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
        completed,
    } = req.query;

    // Build filter — always scope to current user
    const filter = { user: req.user._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (completed !== undefined) filter.completed = completed === 'true';

    // Case-insensitive search across title and description
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    // Build sort
    const sortOptions = {};
    const validSortFields = ['createdAt', 'deadline', 'priority', 'title', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
        Task.find(filter).sort(sortOptions).skip(skip).limit(limitNum),
        Task.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        count: tasks.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        tasks,
    });
});

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────
export const getTask = asyncHandler(async (req, res) => {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
        throw ApiError.notFound('Task not found');
    }

    res.status(200).json({ success: true, task });
});

// ─── POST /api/tasks ──────────────────────────────────────────────────────
export const createTask = asyncHandler(async (req, res) => {
    const {
        title, description, priority, category,
        deadline, estimatedHours, tags, status, aiSuggestions,
    } = req.body;

    if (!title) {
        throw ApiError.badRequest('Task title is required');
    }

    const task = await Task.create({
        user: req.user._id,
        title,
        description,
        priority,
        category,
        deadline: deadline ? new Date(deadline) : null,
        estimatedHours,
        tags,
        status,
        aiSuggestions,
    });

    res.status(201).json({ success: true, task });
});

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────
export const updateTask = asyncHandler(async (req, res) => {
    // First verify the task belongs to this user
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
        throw ApiError.notFound('Task not found');
    }

    const allowedUpdates = [
        'title', 'description', 'priority', 'category',
        'deadline', 'estimatedHours', 'tags', 'status',
        'completed', 'aiSuggestions', 'order',
    ];

    // Apply only allowed fields to prevent mass assignment
    allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
            task[field] = req.body[field];
        }
    });

    // Handle deadline conversion
    if (req.body.deadline) {
        task.deadline = new Date(req.body.deadline);
    }

    await task.save(); // Triggers pre-save hook for status/completed sync

    res.status(200).json({ success: true, task });
});

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────
export const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!task) {
        throw ApiError.notFound('Task not found');
    }

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
});

// ─── PATCH /api/tasks/:id/toggle ─────────────────────────────────────────
export const toggleTaskComplete = asyncHandler(async (req, res) => {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
        throw ApiError.notFound('Task not found');
    }

    task.completed = !task.completed;
    task.status = task.completed ? 'completed' : 'todo';
    await task.save();

    res.status(200).json({ success: true, task });
});

// ─── GET /api/tasks/stats ─────────────────────────────────────────────────
export const getStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Aggregate stats in a single query using MongoDB's aggregation pipeline
    const stats = await Task.aggregate([
        { $match: { user: userId } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                completed: { $sum: { $cond: ['$completed', 1, 0] } },
                inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
                overdue: {
                    $sum: {
                        $cond: [
                            { $and: [{ $lt: ['$deadline', new Date()] }, { $eq: ['$completed', false] }, { $ne: ['$deadline', null] }] },
                            1, 0,
                        ],
                    },
                },
                urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
                high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
            },
        },
    ]);

    // Weekly completed tasks (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyData = await Task.aggregate([
        {
            $match: {
                user: userId,
                completed: true,
                completedAt: { $gte: sevenDaysAgo },
            },
        },
        {
            $group: {
                _id: { $dayOfWeek: '$completedAt' },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Category breakdown
    const categoryBreakdown = await Task.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
    ]);

    const result = stats[0] || { total: 0, completed: 0, inProgress: 0, overdue: 0, urgent: 0, high: 0 };
    result.completionRate = result.total > 0
        ? Math.round((result.completed / result.total) * 100)
        : 0;

    res.status(200).json({
        success: true,
        stats: result,
        weeklyData,
        categoryBreakdown,
    });
});