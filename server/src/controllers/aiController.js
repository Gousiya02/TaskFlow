/**
 * src/controllers/aiController.js — AI Suggestions Controller
 *
 * Thin wrapper around aiService. Handles HTTP layer concerns:
 * input validation, error handling, response formatting.
 */

import { analyzeTask } from '../services/aiService.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';

// ─── POST /api/ai/suggest ─────────────────────────────────────────────────
export const getSuggestions = asyncHandler(async (req, res) => {
    const { taskDescription } = req.body;

    if (!taskDescription || taskDescription.trim().length === 0) {
        throw ApiError.badRequest('Task description is required');
    }

    if (taskDescription.length > 500) {
        throw ApiError.badRequest('Task description must be under 500 characters');
    }

    const currentDate = new Date().toISOString();

    // Call AI service — errors bubble up to global error handler
    const suggestions = await analyzeTask(taskDescription.trim(), currentDate);

    res.status(200).json({
        success: true,
        suggestions,
        analyzedText: taskDescription,
    });
});