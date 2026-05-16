/**
 * src/middleware/authMiddleware.js — JWT Authentication Guard
 *
 * Verifies the Bearer token on every protected route.
 * Attaches the user object to req.user for downstream controllers.
 *
 * MENTOR NOTE: We look up the user on every request (not just decode JWT)
 * so if a user is deleted, their token immediately stops working.
 * Trade-off: extra DB query per request. For scale, use Redis token blacklist.
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/asyncHandler.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Extract token from Authorization header: "Bearer <token>"
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw ApiError.unauthorized('Access denied. No token provided.');
    }

    // Verify token signature and expiry
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw ApiError.unauthorized('Token expired. Please login again.');
        }
        throw ApiError.unauthorized('Invalid token.');
    }

    // Fetch fresh user data (ensures deleted users can't use old tokens)
    const user = await User.findById(decoded.id);
    if (!user) {
        throw ApiError.unauthorized('User no longer exists.');
    }

    req.user = user; // Attach user to request object
    next();
});