/**
 * src/api/authApi.js — Authentication API Service
 */
import api from './axios.js';

export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updatePreferences: (data) => api.patch('/auth/preferences', data),
};


/**
 * src/api/taskApi.js — Task CRUD API Service
 */
export const taskApi = {
    getTasks: (params) => api.get('/tasks', { params }),
    getTask: (id) => api.get(`/tasks/${id}`),
    createTask: (data) => api.post('/tasks', data),
    updateTask: (id, data) => api.put(`/tasks/${id}`, data),
    deleteTask: (id) => api.delete(`/tasks/${id}`),
    toggleTask: (id) => api.patch(`/tasks/${id}/toggle`),
    getStats: () => api.get('/tasks/stats'),
};


/**
 * src/api/aiApi.js — AI Suggestions API Service
 */
export const aiApi = {
    getSuggestions: (taskDescription) =>
        api.post('/ai/suggest', { taskDescription }),
};