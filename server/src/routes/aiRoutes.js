/**
 * src/routes/aiRoutes.js
 */
import express from 'express';
import { getSuggestions } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// AI route: protected + extra rate limit (AI API is expensive)
router.post('/suggest', protect, aiLimiter, getSuggestions);

export default router;