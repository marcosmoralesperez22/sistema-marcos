// =============================================
// API CLIENT — HTTP client for Express backend
// =============================================

const BASE = '/api';

async function request(method, path, body) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${BASE}${path}`, opts);
    const data = await res.json();

    if (!res.ok) {
        if (res.status === 401) {
            // Not authenticated — redirect to login
            window.__showLogin?.();
            throw new Error('Not authenticated');
        }
        throw new Error(data.error || 'Request failed');
    }
    return data;
}

// Auth
export const api = {
    // Auth
    login: (username, password) => request('POST', '/auth/login', { username, password }),
    logout: () => request('POST', '/auth/logout'),
    me: () => request('GET', '/auth/me'),

    // Game state
    getState: () => request('GET', '/state'),
    saveState: (state) => request('PUT', '/state', state),

    // Tasks
    getTasks: (date) => request('GET', `/tasks?date=${date || new Date().toISOString().split('T')[0]}`),
    addTask: (task) => request('POST', '/tasks', task),
    completeTask: (id) => request('PUT', `/tasks/${id}/complete`),
    uncompleteTask: (id) => request('PUT', `/tasks/${id}/uncomplete`),
    failTask: (id) => request('PUT', `/tasks/${id}/fail`),
    deleteTask: (id) => request('DELETE', `/tasks/${id}`),
    updateTask: (id, data) => request('PUT', `/tasks/${id}`, data),
    reorderTasks: (updates) => request('POST', '/tasks/reorder', { updates }),
    initDailyTasks: (tasks) => request('POST', '/tasks/init-daily', { tasks }),

    // History
    addHistory: (entry) => request('POST', '/history', entry),
    getHistory: () => request('GET', '/history'),
    removeHistory: (taskId) => request('DELETE', `/history/undo/${taskId}`),

    // Daily
    saveDailyData: (date, data) => request('PUT', `/daily/${date}`, data),
    getDailyData: () => request('GET', '/daily'),
    getDayTasks: (date) => request('GET', `/daily/${date}/tasks`),

    // Calendar
    getGoogleEvents: () => request('GET', '/calendar/events'),

    // Activity
    addActivity: (type, message, emoji) => request('POST', '/activity', { type, message, emoji }),

    // Reset
    reset: () => request('POST', '/reset'),
};
