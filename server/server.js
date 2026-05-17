/**
 * server.js — Express Application Entry Point
 * 
 * Bootstraps the entire backend:
 *  - Security middleware (Helmet, CORS, Rate Limiting)
 *  - Body parsing
 *  - Route mounting
 *  - MongoDB connection
 *  - Global error handler
 * 
 * MENTOR NOTE: We separate app config from server.listen() to make
 * testing easier (you can import app without starting the server).
 */

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import { connectDB } from './src/config/db.js';
import { authLimiter, apiLimiter } from './src/middleware/rateLimiter.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';

import authRoutes from './src/routes/authRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';



const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB Atlas ───────────────────────────────────────────────
connectDB();

// ─── Security Middleware ─────────────────────────────────────────────────────
// Helmet sets secure HTTP headers (XSS, clickjacking, etc.)
app.use(helmet());

// CORS: allow your frontend origin (localhost or any Render URL)
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || origin.includes('localhost') || origin.endsWith('.onrender.com')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // allow cookies/auth headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Request Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));       // Prevent huge JSON payloads
app.use(express.urlencoded({ extended: true }));

// ─── Logging ─────────────────────────────────────────────────────────────────
// 'dev' format in development, 'combined' in production
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Strict limit on auth endpoints to prevent brute-force attacks
app.use('/api/auth', authLimiter);
// General API limit to prevent abuse
app.use('/api', apiLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);    // POST /api/auth/register, /login, /me
app.use('/api/tasks', taskRoutes);   // CRUD for tasks (protected)
app.use('/api/ai', aiRoutes);        // AI suggestion endpoint (protected)

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);     // 404 for unmatched routes
app.use(errorHandler); // Global error formatter

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 TaskFlow AI Server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health: http://localhost:${PORT}/health\n`);
});

export default app;