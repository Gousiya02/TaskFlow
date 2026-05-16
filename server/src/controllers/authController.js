/**
 * src/controllers/authController.js — Authentication Controller
 *
 * Handles user registration, login, and profile retrieval.
 * Each handler is thin — business logic stays in the model/utils.
 *
 * MENTOR NOTE: Controllers should be thin. Their job:
 *  1. Extract data from req
 *  2. Call model/service
 *  3. Send response
 * Any business logic belongs in services or models.
 */

import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';

// ─── Helper: Build auth response payload ─────────────────────────────────
const authResponse = (user, res, statusCode = 200) => {
    const token = generateToken(user._id);

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            preferences: user.preferences,
            createdAt: user.createdAt,
        },
    });
};

// ─── POST /api/auth/register ──────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
        throw ApiError.badRequest('Name, email, and password are required');
    }

    // Check for existing account
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw ApiError.badRequest('An account with this email already exists');
    }

    // Create user — password hashing handled by pre-save hook in model
    const user = await User.create({ name, email, password });

    authResponse(user, res, 201);
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw ApiError.badRequest('Email and password are required');
    }

    // Use .select('+password') because password field has select: false in schema
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
        // SECURITY: Generic message — don't reveal if email exists or not
        throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    authResponse(user, res, 200);
});

// ─── GET /api/auth/me (protected) ────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
    // req.user is attached by the protect middleware
    const user = await User.findById(req.user._id);
    if (!user) {
        throw ApiError.notFound('User not found');
    }

    res.status(200).json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            preferences: user.preferences,
            createdAt: user.createdAt,
        },
    });
});

// ─── PATCH /api/auth/preferences (protected) ─────────────────────────────
export const updatePreferences = asyncHandler(async (req, res) => {
    const { darkMode, emailNotifications } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { 'preferences.darkMode': darkMode, 'preferences.emailNotifications': emailNotifications } },
        { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, preferences: user.preferences });
});