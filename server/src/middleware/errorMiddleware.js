/**
 * src/middleware/errorMiddleware.js — Global Error Handler
 *
 * MENTOR NOTE: Express error handlers take 4 args: (err, req, res, next).
 * Express identifies them by arity — the 4th param is REQUIRED even if unused.
 *
 * All unhandled errors funnel here. We:
 *  1. Normalize Mongoose errors to our ApiError format
 *  2. Never leak stack traces in production
 *  3. Always return consistent JSON shape
 */

import { ApiError } from '../utils/asyncHandler.js';

// ─── 404 Handler — mounted AFTER all routes ───────────────────────────────
export const notFound = (req, res, next) => {
    next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// ─── Global Error Handler ─────────────────────────────────────────────────
export const errorHandler = (err, req, res, next) => {
    let error = err;

    // ── Normalize non-ApiError instances ──────────────────────────────────

    // Mongoose: Invalid ObjectId (e.g., /api/tasks/not-a-valid-id)
    if (err.name === 'CastError') {
        error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
    }

    // Mongoose: Duplicate key (e.g., email already registered)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        error = ApiError.badRequest(`${field} '${value}' already exists`);
    }

    // Mongoose: Validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        error = ApiError.badRequest('Validation failed', messages);
    }

    // JWT errors (caught in middleware, but just in case)
    if (err.name === 'JsonWebTokenError') {
        error = ApiError.unauthorized('Invalid token');
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        errors: error.errors || [],
        // Only include stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};