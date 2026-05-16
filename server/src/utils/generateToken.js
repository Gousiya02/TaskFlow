/**
 * src/utils/generateToken.js — JWT Sign Utility
 *
 * Centralizes token generation. If you ever change algo or expiry,
 * you change it in ONE place, not scattered across controllers.
 */

import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT for a user
 * @param {string} userId — MongoDB ObjectId as string
 * @returns {string} signed JWT token
 */
export const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
            algorithm: 'HS256',
        }
    );
};