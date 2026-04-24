// =============================================
// STORE — Central state management (API + localStorage cache)
// =============================================

import { DEFAULT_TASKS, CATEGORIES, CATEGORY_LIST } from './defaultTasks.js';
import { api } from './api.js';

const STORAGE_KEY = 'marcos_data';

// Default state shape
function createDefaultState() {
    return {
        player: {
            name: 'Marcos',
            streak: 0,
            bestStreak: 0,
            lastActiveDate: null,
            totalProductiveHours: 0,
            totalTasksCompleted: 0,
            pomodoros: 0,
            aura: 0,
            createdAt: new Date().toISOString(),
        },
        tasks: [],
        taskHistory: [],
        pomodoroHistory: [],
        activityLog: [],
        achievements: {},
        settings: {
            fitnessStartDate: '2026-03-02',
        },
        dailyData: {},
        googleEvents: [], // Cache for Google Calendar events
    };
}

class Store {
    constructor() {
        this.data = this._loadCache();
        this.listeners = [];
        this._saveTimer = null;
        // Ensures overlapping fast-clicks sync correctly to API
        this._taskQueue = {};
    }

    _queueApi(id, promiseFn) {
        if (!this._taskQueue[id]) this._taskQueue[id] = Promise.resolve();
        this._taskQueue[id] = this._taskQueue[id].then(promiseFn).catch(e => console.warn(e));
    }

    // Load from localStorage cache
    _loadCache() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return this._mergeDefaults(parsed);
            }
        } catch (e) { /* ignore */ }
        return createDefaultState();
    }

    _mergeDefaults(saved) {
        const defaults = createDefaultState();
        return {
            ...defaults,
            ...saved,
            player: { ...defaults.player, ...saved.player },
            settings: { ...defaults.settings, ...saved.settings },
        };
    }

    // Load from backend API
    async loadFromAPI() {
        try {
            const state = await api.getState();
            this.data = this._mergeDefaults(state);

            // Also fetch daily data to get Zepp health metrics
            try {
                const daily = await api.getDailyData();
                this.data.dailyData = daily;
            } catch (err) {
                console.warn('Could not load daily data', err);
            }

            this._saveCache();
            this.notify();
            return true;
        } catch (e) {
            console.warn('Could not load from API, using cache', e);
            return false;
        }
    }

    // Save to localStorage (sync) + backend (async batched)
    save() {
        this._saveCache();
        this.notify();
        this._debounceSaveToAPI();
    }

    _saveCache() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) { /* ignore */ }
    }

    _debounceSaveToAPI() {
        if (this._saveTimer) clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(() => this._saveToAPI(), 300);
    }

    async _saveToAPI() {
        try {
            await api.saveState({
                player: this.data.player,
                achievements: this.data.achievements,
                settings: this.data.settings,
            });
        } catch (e) {
            console.warn('Could not save to API', e);
        }
    }

    subscribe(fn) {
        this.listeners.push(fn);
        return () => { this.listeners = this.listeners.filter(l => l !== fn); };
    }

    notify() {
        this.listeners.forEach(fn => fn(this.data));
    }

    // --- Getters ---
    get player() { return this.data.player; }
    get tasks() { return this.data.tasks; }
    get taskHistory() { return this.data.taskHistory; }
    get activityLog() { return this.data.activityLog; }
    get achievements() { return this.data.achievements; }
    get settings() { return this.data.settings; }
    get dailyData() { return this.data.dailyData; }
    get googleEvents() { return this.data.googleEvents || []; }

    async fetchGoogleEvents() {
        try {
            const events = await api.getGoogleEvents();
            this.data.googleEvents = events;
            this.notify();
            return events;
        } catch (err) {
            console.warn('Failed to fetch Google Calendar events', err);
            return [];
        }
    }

    // --- Player ---
    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const last = this.data.player.lastActiveDate;
        if (last === today) return;
        if (last) {
            const diff = (new Date(today) - new Date(last)) / (1000 * 60 * 60 * 24);
            if (diff === 1) this.data.player.streak++;
            else if (diff > 1) this.data.player.streak = 1;
        } else {
            this.data.player.streak = 1;
        }
        this.data.player.bestStreak = Math.max(this.data.player.bestStreak, this.data.player.streak);
        this.data.player.lastActiveDate = today;
        this.save();
    }

    updateAura(amount) {
        if (typeof this.data.player.aura !== 'number') this.data.player.aura = 0;
        this.data.player.aura += amount;

        const today = new Date().toISOString().split('T')[0];
        if (!this.data.dailyData[today]) this.data.dailyData[today] = {};
        this.data.dailyData[today].auraEarned = (this.data.dailyData[today].auraEarned || 0) + amount;

        this.save();
    }

    // --- Tasks ---
    async initDailyTasks() {
        const today = new Date().toISOString().split('T')[0];

        try {
            const apiTasks = await api.initDailyTasks(DEFAULT_TASKS);
            if (apiTasks && apiTasks.length > 0) {
                // Filter out tasks that should be habits (now that they are in their own module)
                this.data.tasks = apiTasks.filter(t => t.category !== 'habits' && t.category !== 'fitness' && t.category !== 'youtube');

                // If any habits were removed, we should ideally notify the user or reflect it
                // but for now just having them not show up in Quests is what's requested
            }
        } catch (e) {
            // Fallback to local
        }

        // Reset activity log once if it hasn't been reset yet (using a flag in settings)
        if (!this.data.settings.activityResetFor2026) {
            this.data.activityLog = [];
            this.data.settings.activityResetFor2026 = true;
        }

        this._saveCache();
        this.notify();
    }

    addTask(task) {
        const today = new Date().toISOString().split('T')[0];
        const newTask = {
            id: `custom_${Date.now()}`,
            date: today,
            status: 'pending',
            completedAt: null,
            priority: 'normal',
            recurring: 'none',
            ...task,
        };
        this.data.tasks.push(newTask);
        this.save();

        // Also save to API
        this._queueApi('addTask', () => api.addTask({
            task_id: newTask.id,
            template_id: newTask.templateId || newTask.id,
            name: newTask.name,
            category: newTask.category,
            priority: newTask.priority,
            recurring: newTask.recurring,
            date: today,
            subtasks: newTask.subtasks || [],
            time_est: newTask.timeEst || 0,
            tags: newTask.tags || [],
            sort_order: newTask.sortOrder || 0,
        }));

        this.addActivity('task_add', `Añadiste la tarea: ${task.name}`, '📝');

        return newTask;
    }

    completeTask(taskId) {
        const task = this.data.tasks.find(t => String(t.id) === String(taskId) || String(t.taskId) === String(taskId));
        if (!task || task.status === 'completed') return null;
        task.status = 'completed';
        task.completedAt = new Date().toISOString();
        this.data.player.totalTasksCompleted = Number(this.data.player.totalTasksCompleted || 0) + 1;
        this.save();
        this.updateAura(10);

        if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks.forEach(s => s.done = true);
        }

        // Sync to API (use DB id if available)
        const dbId = task.id;
        const mappedId = String(dbId).includes('_') ? dbId : parseInt(dbId, 10);
        if (mappedId) {
            this._queueApi(mappedId, () => {
                api.completeTask(mappedId);
                if (task.subtasks && task.subtasks.length > 0) {
                    api.updateTask(mappedId, { subtasks: task.subtasks });
                }
            });
        }

        this.addActivity('task_complete', `Completaste: ${task.name}`, '✅');

        return task;
    }

    uncompleteTask(taskId) {
        const task = this.data.tasks.find(t => String(t.id) === String(taskId) || String(t.taskId) === String(taskId));
        if (!task || task.status !== 'completed') return null;
        task.status = 'pending';
        task.completedAt = null;
        this.data.player.totalTasksCompleted = Math.max(0, Number(this.data.player.totalTasksCompleted || 0) - 1);
        this.save();
        this.updateAura(-10);

        if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks.forEach(s => s.done = false);
        }

        const dbId = task.id;
        const mappedId = String(dbId).includes('_') ? dbId : parseInt(dbId, 10);
        if (mappedId) {
            this._queueApi(mappedId, () => {
                api.uncompleteTask(mappedId);
                if (task.subtasks && task.subtasks.length > 0) {
                    api.updateTask(mappedId, { subtasks: task.subtasks });
                }
            });
        }

        this.addActivity('task_uncomplete', `Marcaste como pendiente: ${task.name}`, '🔄');

        return task;
    }

    updateTask(taskId, updates) {
        const task = this.data.tasks.find(t => String(t.id) === String(taskId) || String(t.taskId) === String(taskId));
        if (!task) return null;
        Object.assign(task, updates);
        this.save();

        const dbId = task.id;
        const mappedId = String(dbId).includes('_') ? dbId : parseInt(dbId, 10);
        if (mappedId) {
            const apiUpdates = {};
            if (updates.name !== undefined) apiUpdates.name = updates.name;
            if (updates.subtasks !== undefined) apiUpdates.subtasks = updates.subtasks;
            if (updates.tags !== undefined) apiUpdates.tags = updates.tags;
            if (updates.timeEst !== undefined) apiUpdates.time_est = updates.timeEst;
            if (updates.sortOrder !== undefined) apiUpdates.sort_order = updates.sortOrder;

            this._queueApi(mappedId, () => api.updateTask(mappedId, apiUpdates));
        }
        return task;
    }

    toggleSubtask(taskId, subtaskId) {
        const task = this.data.tasks.find(t => String(t.id) === String(taskId) || String(t.taskId) === String(taskId));
        if (!task || !task.subtasks) return;
        const sub = task.subtasks.find(s => String(s.id) === String(subtaskId));
        if (sub) {
            sub.done = !sub.done;
            this.updateTask(taskId, { subtasks: task.subtasks });

            const allDone = task.subtasks.length > 0 && task.subtasks.every(s => s.done);
            if (allDone && task.status !== 'completed') {
                this.completeTask(taskId);
            } else if (!allDone && task.status === 'completed') {
                this.uncompleteTask(taskId);
            }
        }
    }

    reorderTasks(orderedIds) {
        const updates = [];
        orderedIds.forEach((id, index) => {
            const task = this.data.tasks.find(t => String(t.id) === String(id) || String(t.taskId) === String(id));
            if (task) {
                task.sortOrder = index;
                const dbId = task.id;
                const mappedId = String(dbId).includes('_') ? dbId : parseInt(dbId, 10);
                if (mappedId) {
                    updates.push({ id: mappedId, sort_order: index });
                }
            }
        });

        this.data.tasks.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        this.save();

        if (updates.length > 0) {
            this._queueApi('reorder', () => api.reorderTasks(updates));
        }
    }

    failTask(taskId) {
        const task = this.data.tasks.find(t => String(t.id) === String(taskId) || String(t.taskId) === String(taskId));
        if (!task || task.status !== 'pending') return null;
        task.status = 'failed';
        this.save();
        this.updateAura(-5);
        if (typeof task.id === 'number' || !isNaN(task.id)) {
            this._queueApi(task.id, () => api.failTask(task.id));
        }
        this.addActivity('task_fail', `Fallaste la tarea: ${task.name}`, '❌');
        return task;
    }

    deleteTask(taskId) {
        const index = this.data.tasks.findIndex(t => String(t.id) === String(taskId) || String(t.taskId) === String(taskId));
        if (index === -1) return null;
        const task = this.data.tasks[index];
        this.data.tasks.splice(index, 1);
        this.save();
        if (typeof task.id === 'number' || !isNaN(task.id)) {
            this._queueApi(task.id, () => api.deleteTask(task.id));
        }
        this.addActivity('task_delete', `Eliminaste la tarea: ${task.name}`, '🗑️');
        return task;
    }

    getTodayTasks() {
        const today = new Date().toISOString().split('T')[0];
        return this.data.tasks.filter(t => t.date === today);
    }

    getTodayProgress() {
        const today = this.getTodayTasks();
        if (today.length === 0) return { completed: 0, total: 0, pct: 0 };
        const completed = today.filter(t => t.status === 'completed').length;
        return { completed, total: today.length, pct: Math.round((completed / today.length) * 100) };
    }

    // --- Task History ---
    addTaskHistory(entry) {
        this.data.taskHistory.unshift({ ...entry, date: new Date().toISOString() });
        if (this.data.taskHistory.length > 500) this.data.taskHistory = this.data.taskHistory.slice(0, 500);
        this.save();
        this._queueApi('history', () => api.addHistory({
            task_id: entry.taskId,
            name: entry.name,
            category: entry.category,
            status: entry.status,
        }));
    }

    removeTaskHistory(taskId) {
        const index = this.data.taskHistory.findIndex(h => String(h.taskId) === String(taskId) && h.status === 'completed');
        if (index !== -1) {
            this.data.taskHistory.splice(index, 1);
            this.save();
            this._queueApi('history', () => api.removeHistory(taskId));
        }
    }

    // --- Pomodoro History ---
    addPomodoro(session) {
        // session: { durationMinutes, modeName, emoji, taskId, taskName }
        const today = new Date().toISOString().split('T')[0];
        const entry = {
            id: `pom_${Date.now()}`,
            date: today,
            timestamp: new Date().toISOString(),
            ...session
        };

        this.data.pomodoroHistory.unshift(entry);
        if (this.data.pomodoroHistory.length > 500) this.data.pomodoroHistory = this.data.pomodoroHistory.slice(0, 500);

        // Update stats
        this.data.player.pomodoros = (this.data.player.pomodoros || 0) + 1;

        const hoursToAdd = (session.durationMinutes || 0) / 60;
        this.data.player.totalProductiveHours = (this.data.player.totalProductiveHours || 0) + hoursToAdd;

        this.updateAura(Math.round(hoursToAdd * 20)); // E.g., 20 aura per hour of deep work

        this.save();

        // Ideally save to API here.
    }

    // --- Daily Data ---
    recordDailyData() {
        const today = new Date().toISOString().split('T')[0];
        const progress = this.getTodayProgress();
        this.data.dailyData[today] = {
            completed: progress.completed > 0,
            tasksCompleted: progress.completed,
            totalTasks: progress.total,
            perfect: progress.pct === 100,
        };
        this.save();
        api.saveDailyData(today, {
            tasks_completed: progress.completed,
            total_tasks: progress.total,
            perfect: progress.pct === 100,
        }).catch(() => { });
    }

    // --- Activity Log ---
    addActivity(type, message, emoji = 'edit_note') {
        this.data.activityLog.unshift({ type, message, emoji, timestamp: new Date().toISOString() });
        if (this.data.activityLog.length > 100) this.data.activityLog = this.data.activityLog.slice(0, 100);
        this.save();
        api.addActivity(type, message, emoji).catch(() => { });
    }

    // --- Achievements ---
    unlockAchievement(id, achievementData) {
        if (!this.data.achievements[id]) this.data.achievements[id] = { unlocked: false, progress: 0 };
        this.data.achievements[id].unlocked = true;
        this.data.achievements[id].unlockedAt = new Date().toISOString();
        this.data.achievements[id] = { ...this.data.achievements[id], ...achievementData };
        this.save();
        this.updateAura(50);
    }

    updateAchievementProgress(id, progress) {
        if (!this.data.achievements[id]) this.data.achievements[id] = { unlocked: false, progress: 0 };
        this.data.achievements[id].progress = progress;
        this.save();
    }

    // --- Settings ---
    updateSettings(updates) {
        this.data.settings = { ...this.data.settings, ...updates };
        this.save();
        this.notify(); // Essential to refresh UI when settings (like habitsData) change
    }
    updatePlayerName(name) { this.data.player.name = name; this.save(); }

    async resetAll() {
        try { await api.reset(); } catch (e) { console.warn('API reset failed', e); }
        localStorage.removeItem(STORAGE_KEY);
        this.data = createDefaultState();
        this._saveCache();
    }
    exportData() { return JSON.stringify(this.data, null, 2); }
    importData(json) { try { this.data = this._mergeDefaults(JSON.parse(json)); this.save(); return true; } catch { return false; } }
}

export const store = new Store();

window.addEventListener('beforeunload', () => {
    if (store._saveTimer) {
        clearTimeout(store._saveTimer);
        store._saveToAPI();
    }
});
