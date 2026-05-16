/**
 * src/models/User.js — Mongoose User Schema
 *
 * Stores user accounts. Passwords are NEVER stored in plain text.
 * bcryptjs hashing is done in a pre-save hook so it's automatic.
 *
 * MENTOR NOTE: Using a pre-save hook keeps hashing logic inside the model,
 * not scattered across controllers. Single Responsibility Principle.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Never return password in queries by default
        },
        avatar: {
            type: String,
            default: '', // URL to avatar image (optional, for future use)
        },
        preferences: {
            darkMode: { type: Boolean, default: true },
            emailNotifications: { type: Boolean, default: false },
        },
    },
    {
        timestamps: true, // Adds createdAt, updatedAt automatically
    }
);

// ─── Pre-Save Hook: Hash password before saving ───────────────────────────
userSchema.pre('save', async function (next) {
    // Only hash if password was modified (skip on profile updates)
    if (!this.isModified('password')) return next();

    // Cost factor of 12 = good security/performance balance in 2024
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ─── Instance Method: Compare entered password with hash ─────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Virtual: Hide internal fields from JSON output ──────────────────────
userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
    },
});

const User = mongoose.model('User', userSchema);
export default User;