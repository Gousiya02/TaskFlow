/**
 * src/services/aiService.js — AI Task Analysis Service
 *
 * Uses Gemini API (Google) to analyze task descriptions and suggest:
 *  - Priority level
 *  - Category
 *  - Deadline
 *  - Estimated effort (hours)
 *  - Reasoning for suggestions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are TaskFlow AI, an expert productivity assistant specialized in analyzing task descriptions and providing actionable suggestions.

Your job is to analyze a task description and return structured suggestions in JSON format.

CATEGORIES available: work, personal, health, learning, finance, other
PRIORITIES available: low, medium, high, urgent

PRIORITY GUIDELINES:
- urgent: Deadline within 24 hours, or critical blocking issues
- high: Deadline within 3 days, or significant impact tasks
- medium: Deadline within 1-2 weeks, normal importance
- low: No hard deadline, nice-to-have tasks

EFFORT ESTIMATION GUIDELINES:
- 0.5h: Quick emails, small fixes, 15-30 min tasks
- 1-2h: Brief meetings, focused work sessions
- 3-5h: Half-day tasks, medium complexity features
- 6-8h: Full-day work, complex tasks
- 10-20h: Multi-day projects
- 20+h: Week-long or longer initiatives

RESPONSE FORMAT: Always respond with ONLY valid JSON, no markdown, no explanation outside the JSON.

JSON Schema:
{
  "priority": "low|medium|high|urgent",
  "category": "work|personal|health|learning|finance|other",
  "estimatedHours": number,
  "suggestedDeadline": "ISO 8601 date string or null",
  "reasoning": "Brief explanation of your suggestions (1-2 sentences)",
  "tags": ["relevant", "tag", "keywords"],
  "subtasks": ["optional", "breakdown", "steps"]
}`;

const FEW_SHOT_EXAMPLES = [
    {
        input: "Finish IEEE paper before next Friday",
        output: {
            priority: "high",
            category: "work",
            estimatedHours: 12,
            suggestedDeadline: "next Friday",
            reasoning: "Academic paper deadline is time-sensitive and requires significant focused writing time.",
            tags: ["research", "writing", "academic"],
            subtasks: ["Outline introduction", "Write methodology section", "Review citations", "Final proofreading"]
        }
    },
    {
        input: "Call mom",
        output: {
            priority: "medium",
            category: "personal",
            estimatedHours: 0.5,
            suggestedDeadline: null,
            reasoning: "Personal call with no specified urgency, quick 30-minute task.",
            tags: ["family", "personal"],
            subtasks: []
        }
    }
];

export const analyzeTask = async (taskDescription, currentDate) => {
    const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        systemInstruction: SYSTEM_PROMPT,
    });

    const userMessage = `Current date: ${currentDate}\n\nAnalyze this task:\n"${taskDescription}"\n\nRemember: respond with ONLY the JSON object, no other text.`;

    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: `Current date: ${currentDate}\n\nAnalyze this task:\n"${FEW_SHOT_EXAMPLES[0].input}"` }],
            },
            {
                role: "model",
                parts: [{ text: JSON.stringify(FEW_SHOT_EXAMPLES[0].output) }],
            },
            {
                role: "user",
                parts: [{ text: `Current date: ${currentDate}\n\nAnalyze this task:\n"${FEW_SHOT_EXAMPLES[1].input}"` }],
            },
            {
                role: "model",
                parts: [{ text: JSON.stringify(FEW_SHOT_EXAMPLES[1].output) }],
            },
        ],
        generationConfig: {
            temperature: 0,
            responseMimeType: "application/json",
        },
    });

    const result = await chat.sendMessage(userMessage);
    const rawText = result.response.text();

    const clean = rawText.replace(/```json|```/g, '').trim();
    const suggestions = JSON.parse(clean);

    if (suggestions.suggestedDeadline && typeof suggestions.suggestedDeadline === 'string') {
        suggestions.suggestedDeadline = resolveRelativeDate(
            suggestions.suggestedDeadline,
            currentDate
        );
    }

    return suggestions;
};

const resolveRelativeDate = (dateStr, currentDate) => {
    const now = new Date(currentDate);
    const lower = dateStr.toLowerCase();

    if (lower === 'tomorrow') {
        const d = new Date(now);
        d.setDate(d.getDate() + 1);
        return d.toISOString();
    }

    if (lower === 'next week') {
        const d = new Date(now);
        d.setDate(d.getDate() + 7);
        return d.toISOString();
    }

    const dayMap = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
        thursday: 4, friday: 5, saturday: 6,
    };

    for (const [day, dayNum] of Object.entries(dayMap)) {
        if (lower.includes(day)) {
            const d = new Date(now);
            const currentDay = d.getDay();
            let daysUntil = dayNum - currentDay;
            if (daysUntil <= 0) daysUntil += 7; // Next occurrence
            if (lower.includes('next')) daysUntil += 7;
            d.setDate(d.getDate() + daysUntil);
            return d.toISOString();
        }
    }

    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed.toISOString();

    return null;
};