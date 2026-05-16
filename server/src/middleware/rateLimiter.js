/**
 * src/middleware/rateLimiter.js — Rate Limiting Config
 *
 * Two tiers:
 *  - authLimiter: strict — 10 attempts per 15 min (brute-force protection)
 *  - apiLimiter: lenient — 100 requests per minute (abuse prevention)
 *
 * MENTOR NOTE: Rate limiting is a critical security layer. Without it,
 * attackers can hammer your login endpoint or run up your AI API bill.
 */

import rateLimit from 'express-rate-limit';

// Shared response formatter
const rateLimitResponse = (req, res) => {
    res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
    });
};

// Strict limiter for auth endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 attempts per window
    standardHeaders: true,     // Return RateLimit headers
    legacyHeaders: false,
    handler: rateLimitResponse,
    skipSuccessfulRequests: true, // Only count failed attempts
});

// General API limiter
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,            // 100 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
});

// Strict limiter for AI endpoints (expensive API calls)
export const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,             // 20 AI requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
});