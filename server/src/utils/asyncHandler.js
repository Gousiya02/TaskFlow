/**
 * src/utils/asyncHandler.js — Async Try/Catch Wrapper
 *
 * MENTOR NOTE: Without this, every async controller would need its own
 * try/catch. This wrapper passes errors to Express's next() automatically,
 * letting our global errorHandler deal with them.
 *
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))
 */

export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};


/**
 * src/utils/apiError.js — Custom API Error Class
 *
 * Extends Error with a statusCode so our errorHandler can
 * return proper HTTP status codes (400, 401, 404, etc.)
 *
 * Usage: throw new ApiError(404, 'Task not found')
 */

export class ApiError extends Error {
    constructor(statusCode, message, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors; // Array of validation errors
        this.isOperational = true; // Distinguish from programming errors
        Error.captureStackTrace(this, this.constructor);
    }

    // Factory methods for common errors
    static badRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }

    static unauthorized(message = 'Not authorized') {
        return new ApiError(401, message);
    }

    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }

    static notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    }

    static internal(message = 'Internal server error') {
        return new ApiError(500, message);
    }
}