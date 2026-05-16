/**
 * src/routes/taskRoutes.js
 *
 * All routes are protected (require JWT).
 * Stats route is defined BEFORE /:id to avoid "stats" being
 * treated as a MongoDB ObjectId — a common routing mistake!
 */
import express from 'express';
import {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    getStats,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All task routes require authentication
router.use(protect);

// Stats — MUST be before /:id route
router.get('/stats', getStats);

// Collection routes
router.route('/')
    .get(getTasks)
    .post(createTask);

// Individual task routes
router.route('/:id')
    .get(getTask)
    .put(updateTask)
    .delete(deleteTask);

// Toggle completion
router.patch('/:id/toggle', toggleTaskComplete);

export default router;