/**
 * src/routes/authRoutes.js
 */
import express from 'express';
import { register, login, getMe, updatePreferences } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes — require valid JWT
router.get('/me', protect, getMe);
router.patch('/preferences', protect, updatePreferences);

export default router;