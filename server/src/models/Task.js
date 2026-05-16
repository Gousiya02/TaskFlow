/**
 * src/models/Task.js — Mongoose Task Schema
 *
 * Core data model for the app. Each task belongs to a user (ref).
 * Supports: priorities, categories, deadlines, completion, AI metadata.
 *
 * MENTOR NOTE: The `aiSuggestions` sub-document stores what the AI recommended
 * vs what the user actually chose. This data is gold for ML improvements later.
 */

import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        // ── Ownership ─────────────────────────────────────────────────────────
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true, // Index for fast user-specific queries
        },

        // ── Core Task Fields ──────────────────────────────────────────────────
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
            minlength: [1, 'Title cannot be empty'],
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
            default: '',
        },

        // ── Classification ────────────────────────────────────────────────────
        priority: {
            type: String,
            enum: {
                values: ['low', 'medium', 'high', 'urgent'],
                message: 'Priority must be low, medium, high, or urgent',
            },
            default: 'medium',
        },
        category: {
            type: String,
            enum: {
                values: ['work', 'personal', 'health', 'learning', 'finance', 'other'],
                message: 'Invalid category',
            },
            default: 'other',
        },
        tags: [{ type: String, trim: true, lowercase: true }],

        // ── Status & Timeline ─────────────────────────────────────────────────
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'completed'],
            default: 'todo',
        },
        completed: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        deadline: {
            type: Date,
            default: null,
        },

        // ── Effort Estimation ─────────────────────────────────────────────────
        estimatedHours: {
            type: Number,
            min: 0,
            max: 1000,
            default: null,
        },

        // ── AI Metadata ───────────────────────────────────────────────────────
        // Store AI suggestions separately from user-applied values
        // This enables analytics: "how often do users accept AI suggestions?"
        aiSuggestions: {
            priority: String,
            category: String,
            estimatedHours: Number,
            deadline: Date,
            reasoning: String,       // Why the AI made these suggestions
            appliedByUser: {         // Did the user accept the suggestions?
                type: Boolean,
                default: false,
            },
        },

        // ── Order ─────────────────────────────────────────────────────────────
        order: {
            type: Number,
            default: 0, // For manual drag-and-drop ordering (future feature)
        },
    },
    {
        timestamps: true,
    }
);

// ─── Indexes for Common Queries ───────────────────────────────────────────
// Compound index: fetch all tasks for a user, sorted by deadline
taskSchema.index({ user: 1, deadline: 1 });
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, createdAt: -1 });

// ─── Pre-save: Sync `completed` boolean with status ───────────────────────
taskSchema.pre('save', function (next) {
    if (this.status === 'completed' && !this.completed) {
        this.completed = true;
        this.completedAt = new Date();
    }
    if (this.completed && !this.completedAt) {
        this.completedAt = new Date();
    }
    // Reset completedAt if un-completing a task
    if (!this.completed && this.completedAt) {
        this.completedAt = null;
        if (this.status === 'completed') this.status = 'todo';
    }
    next();
});

// ─── Clean JSON output ────────────────────────────────────────────────────
taskSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        return ret;
    },
});

const Task = mongoose.model('Task', taskSchema);
export default Task;