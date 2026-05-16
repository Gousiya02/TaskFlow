/**
 * src/config/db.js — MongoDB Atlas Connection
 *
 * Uses Mongoose to connect to Atlas. Implements:
 *  - Connection retry logic via mongoose's built-in reconnection
 *  - Clean process exit on critical failure
 *
 * MENTOR NOTE: We export a function instead of connecting at import-time.
 * This lets us control WHEN the connection happens (after env vars are loaded).
 */

import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // These options silence Mongoose deprecation warnings
            serverSelectionTimeoutMS: 5000, // Fail fast if Atlas unreachable
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Listen for connection events after initial connect
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
        });

    } catch (error) {
        console.error('❌ MongoDB initial connection failed:', error.message);
        // Exit with failure code — Render/Heroku will restart the process
        process.exit(1);
    }
};