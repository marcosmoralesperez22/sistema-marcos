// =============================================
// API ROUTES — Game state CRUD
// =============================================

import { Router } from 'express';
import pool from '../db.js';
import { fetchGoogleCalendarEvents, listCalendars } from '../calendar.js';

const router = Router();

// Auth middleware
function requireAuth(req, res, next) {
    if (!req.session?.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
}

// --- ZEPP SYNC ROUTE (No Auth required for watch) ---
// Note: Zepp OS fetch doesn't include cookies/session, so we allow this endpoint
// and default to user 'Marcos' if no userId is found.
router.post('/zepp/sync', async (req, res) => {
    let userId = req.session?.userId;
    if (!userId) {
        // Fallback for personal deploy without auth token from Zepp
        const userRes = await pool.query("SELECT id FROM users WHERE username = 'Marcos'");
        if (userRes.rows.length > 0) userId = userRes.rows[0].id;
        else return res.status(401).json({ error: 'Unauthorized' });
    }

    const { date, steps, calories, sleepScore } = req.body;
    console.log(`[Backend] Zepp Sync Received - User: ${userId}, Steps: ${steps}, Date: ${date || 'today'}`);
    const syncDate = date || formatDateLocal(new Date());

    try {
        await pool.query(
            `INSERT INTO daily_data (user_id, date, steps, calories, sleep_score)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id, date) DO UPDATE SET
               steps = EXCLUDED.steps,
               calories = EXCLUDED.calories,
               sleep_score = EXCLUDED.sleep_score`,
            [userId, syncDate, steps || 0, calories || 0, sleepScore || 0]
        );
        res.json({ ok: true, synced: true });
    } catch (err) {
        console.error('POST /zepp/sync error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.use(requireAuth);

function formatDateLocal(d) {
    if (!d) return d;
    if (typeof d === 'string') return d.split('T')[0];
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// ---- GAME STATE ----

// GET /api/state — Full game state
router.get('/state', async (req, res) => {
    try {
        const gs = await pool.query('SELECT * FROM game_state WHERE user_id = $1', [req.session.userId]);
        const tasks = await pool.query('SELECT * FROM tasks WHERE user_id = $1 AND date = CURRENT_DATE ORDER BY created_at', [req.session.userId]);
        const history = await pool.query('SELECT * FROM task_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 500', [req.session.userId]);
        const daily = await pool.query('SELECT * FROM daily_data WHERE user_id = $1 ORDER BY date DESC LIMIT 365', [req.session.userId]);
        const activity = await pool.query('SELECT * FROM activity_log WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100', [req.session.userId]);

        const state = gs.rows[0] || {};
        const playerData = state.player || {};

        // Compute real totalTasksCompleted from task_history
        const completedCount = await pool.query(
            `SELECT COUNT(*) FROM task_history WHERE user_id = $1 AND status = 'completed'`,
            [req.session.userId]
        );
        playerData.totalTasksCompleted = parseInt(completedCount.rows[0].count, 10);

        res.json({
            player: playerData,
            armor: state.armor || {},
            amulets: state.amulets || [],
            inventory: state.inventory || {},
            achievements: state.achievements || {},
            settings: state.settings || {},
            tasks: tasks.rows.map(mapTask),
            taskHistory: history.rows.map(mapHistory),
            dailyData: daily.rows.reduce((acc, r) => {
                acc[formatDateLocal(r.date)] = {
                    tasksCompleted: r.tasks_completed,
                    totalTasks: r.total_tasks,
                    xpEarned: r.xp_earned,
                    perfect: r.perfect,
                    completed: r.tasks_completed > 0,
                    steps: r.steps || 0,
                    calories: r.calories || 0,
                    sleepScore: r.sleep_score || 0
                };
                return acc;
            }, {}),

            activityLog: activity.rows.map(r => ({ type: r.type, message: r.message, emoji: r.emoji, timestamp: r.created_at })),
        });
    } catch (err) {
        console.error('GET /state error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/state — Save full game state
router.put('/state', async (req, res) => {
    const { player, armor, amulets, inventory, achievements, settings } = req.body;
    try {
        await pool.query(
            `INSERT INTO game_state (user_id, player, armor, amulets, inventory, achievements, settings, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         player = EXCLUDED.player,
         armor = EXCLUDED.armor,
         amulets = EXCLUDED.amulets,
         inventory = EXCLUDED.inventory,
         achievements = EXCLUDED.achievements,
         settings = EXCLUDED.settings,
         updated_at = NOW()`,
            [req.session.userId, JSON.stringify(player || {}), JSON.stringify(armor || {}), JSON.stringify(amulets || []), JSON.stringify(inventory || {}), JSON.stringify(achievements || {}), JSON.stringify(settings || {})]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error('PUT /state error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ---- GOOGLE CALENDAR ----
// GET /api/calendar/events
router.get('/calendar/events', async (req, res) => {
    try {
        const timeMin = new Date();
        timeMin.setDate(timeMin.getDate() - 30); // 30 days ago
        const timeMax = new Date();
        timeMax.setDate(timeMax.getDate() + 90); // 90 days ahead

        const calendars = await listCalendars();
        // Fallback to primary if list fails or is empty, though primary should be in the list
        const calendarIds = calendars.length > 0 ? calendars.map(c => c.id) : ['marcosmoralesperez22@gmail.com'];

        const allEventsPromises = calendarIds.map(id =>
            fetchGoogleCalendarEvents(id, timeMin.toISOString(), timeMax.toISOString())
        );

        const results = await Promise.all(allEventsPromises);
        const allEvents = results.flat();

        // Format them nicely for the frontend
        const formattedEvents = allEvents.map(ev => {
            const isAllDay = !!ev.start.date;
            const startStr = ev.start.dateTime || ev.start.date;
            const endStr = ev.end.dateTime || ev.end.date;

            // Extract exactly what Google sent us (e.g. "2026-03-07") without timezone adjustments
            const dateStr = startStr.substring(0, 10);

            const startDate = new Date(startStr);
            const endDate = new Date(endStr);

            const startTimeStr = isAllDay ? '00:00' : startDate.toTimeString().split(' ')[0].substring(0, 5);
            const endTimeStr = isAllDay ? '23:59' : endDate.toTimeString().split(' ')[0].substring(0, 5);

            return {
                id: `gcal-${ev.id}`,
                title: ev.summary || '(Sin título)',
                date: dateStr,
                start: startTimeStr,
                end: endTimeStr,
                color: '#4285F4', // Google Blue
                isGoogle: true
            };
        });

        res.json(formattedEvents);
    } catch (err) {
        console.error('GET /calendar/events error:', err);
        res.status(500).json({ error: 'Server error fetching calendar' });
    }
});

// ---- TASKS ----

// Sync Google Events to Tasks for a given date
async function syncGoogleTasksForDate(userId, dateStr) {
    try {
        const timeMin = new Date(dateStr + 'T00:00:00.000Z');
        const timeMax = new Date(dateStr + 'T23:59:59.999Z');
        console.log(`[Sync] Fetching Google events for date ${dateStr} between ${timeMin.toISOString()} and ${timeMax.toISOString()}`);

        const calendars = await listCalendars();
        const calendarIds = calendars.length > 0 ? calendars.map(c => c.id) : ['marcosmoralesperez22@gmail.com'];

        const results = await Promise.all(calendarIds.map(id =>
            fetchGoogleCalendarEvents(id, timeMin.toISOString(), timeMax.toISOString())
        ));
        const allEvents = results.flat();

        console.log(`[Sync] Found ${allEvents.length} total events from ${calendarIds.length} calendars.`);

        // 1. Get existing calendar tasks for this day
        const existingRes = await pool.query('SELECT task_id FROM tasks WHERE user_id = $1 AND date = $2 AND category = $3', [userId, dateStr, 'calendar']);
        const existingTaskIds = existingRes.rows.map(r => r.task_id);

        // 2. Identify current event IDs (use taskId to avoid duplicates across calendars if they exist)
        const currentEventIds = allEvents.map(ev => `gcal-${ev.id}`);

        // 3. Delete tasks that were removed from Google Calendar
        const toDeleteIds = existingTaskIds.filter(id => id.startsWith('gcal-') && !currentEventIds.includes(id));
        if (toDeleteIds.length > 0) {
            console.log(`[Sync] Deleting ${toDeleteIds.length} stale events:`, toDeleteIds);
            await pool.query('DELETE FROM tasks WHERE user_id = $1 AND date = $2 AND task_id = ANY($3::text[])', [userId, dateStr, toDeleteIds]);
        }

        // 4. Insert or update existing events
        let inserted = 0, updated = 0;
        // Use a Set to avoid processing the same event ID twice if it appears in multiple shared calendars
        const processedIds = new Set();

        for (const ev of allEvents) {
            const taskId = `gcal-${ev.id}`;
            if (processedIds.has(taskId)) continue;
            processedIds.add(taskId);

            const title = ev.summary || '(Sin título)';

            // REMOVED RESTRICTIVE FILTER: ev.eventType !== 'focusTime'
            // We want all timed events to show up as tasks.

            const isAllDay = !!ev.start.date;
            if (isAllDay) continue; // Keep only timed events for the task list to avoid cluttering daily goals

            const startStr = ev.start.dateTime || ev.start.date;
            const startDate = new Date(startStr);
            const timeSpan = startDate.toTimeString().split(' ')[0].substring(0, 5);

            const taskName = `${timeSpan} - ${title}`;

            if (!existingTaskIds.includes(taskId)) {
                // Insert new event task with NULL template_id so it doesn't break daily init
                await pool.query(
                    `INSERT INTO tasks (user_id, task_id, template_id, name, category, xp, reward_tier, priority, recurring, date, subtasks, time_est, tags, sort_order)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, '[]', 0, '[]', 0)`,
                    [userId, taskId, null, taskName, 'calendar', 10, 'common', 'medium', 'none', dateStr]
                );
                inserted++;
            } else {
                // Update existing event task (in case title or time changed)
                await pool.query(
                    `UPDATE tasks SET name = $1 WHERE user_id = $2 AND task_id = $3`,
                    [taskName, userId, taskId]
                );
                updated++;
            }
        }
        if (inserted > 0 || updated > 0) {
            console.log(`[Sync] Finished: Inserted ${inserted}, Updated ${updated} events for ${dateStr}.`);
        }
    } catch (err) {
        console.error('[Sync] Error syncing Google tasks:', err);
    }
}

// GET /api/tasks?date=YYYY-MM-DD
router.get('/tasks', async (req, res) => {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    try {
        await syncGoogleTasksForDate(req.session.userId, date); // Auto-sync before returning
        const result = await pool.query(`
            SELECT * FROM tasks
            WHERE user_id = $1 AND (date = $2 OR (status = 'pending' AND date < $2))
            ORDER BY date ASC, sort_order ASC, id ASC
        `, [req.session.userId, date]);
        res.json(result.rows.map(mapTask));
    } catch (err) {
        console.error('GET /tasks error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/tasks — Add task
router.post('/tasks', async (req, res) => {
    const { task_id, template_id, name, category, xp, reward_tier, priority, recurring, date, subtasks, time_est, tags, sort_order } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO tasks (user_id, task_id, template_id, name, category, xp, reward_tier, priority, recurring, date, subtasks, time_est, tags, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
            [req.session.userId, task_id, template_id, name, category, xp || 30, reward_tier || 'common', priority || 'normal', recurring || 'none', date || new Date().toISOString().split('T')[0], JSON.stringify(subtasks || []), time_est || 0, JSON.stringify(tags || []), sort_order || 0]
        );
        res.json(mapTask(result.rows[0]));
    } catch (err) {
        console.error('POST /tasks error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/tasks/:id/complete
router.put('/tasks/:id/complete', async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE tasks SET status = 'completed', completed_at = NOW() WHERE (id::text = $1 OR task_id = $1) AND user_id = $2 RETURNING *`,
            [req.params.id, req.session.userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.json(mapTask(result.rows[0]));
    } catch (err) {
        console.error('PUT /tasks/:id/complete error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/tasks/:id/uncomplete
router.put('/tasks/:id/uncomplete', async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE tasks SET status = 'pending', completed_at = NULL WHERE (id::text = $1 OR task_id = $1) AND user_id = $2 RETURNING *`,
            [req.params.id, req.session.userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.json(mapTask(result.rows[0]));
    } catch (err) {
        console.error('PUT /tasks/:id/uncomplete error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/tasks/:id/fail
router.put('/tasks/:id/fail', async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE tasks SET status = 'failed' WHERE id = $1 AND user_id = $2 RETURNING *`,
            [req.params.id, req.session.userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.json(mapTask(result.rows[0]));
    } catch (err) {
        console.error('PUT /tasks/:id/fail error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/tasks/:id
router.delete('/tasks/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *`,
            [req.params.id, req.session.userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.json({ ok: true });
    } catch (err) {
        console.error('DELETE /tasks/:id error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/tasks/init-daily — Initialize daily tasks
router.post('/tasks/init-daily', async (req, res) => {
    const { tasks } = req.body; // Array of default tasks to create
    const today = new Date().toISOString().split('T')[0];
    try {
        // Sync before query
        await syncGoogleTasksForDate(req.session.userId, today);

        // Check if daily tasks already exist (template_id IS NOT NULL ensures we don't count manual/calendar tasks)
        const existing = await pool.query('SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND date = $2 AND template_id IS NOT NULL', [req.session.userId, today]);
        if (parseInt(existing.rows[0].count) > 0) {
            // Return today's tasks + overdue past tasks
            const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 AND (date = $2 OR (status = \'pending\' AND date < $2)) ORDER BY date ASC, sort_order ASC, id ASC', [req.session.userId, today]);
            return res.json(result.rows.map(mapTask));
        }

        // Insert daily tasks
        let order = 0;
        for (const t of tasks) {
            await pool.query(
                `INSERT INTO tasks (user_id, task_id, template_id, name, category, xp, reward_tier, priority, recurring, date, subtasks, time_est, tags, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                [req.session.userId, t.id, t.templateId || t.id, t.name, t.category, t.xp || 30, t.rewardTier || 'common', t.priority || 'normal', t.recurring || 'daily', today, JSON.stringify(t.subtasks || []), t.time_est || 0, JSON.stringify(t.tags || []), order++]
            );
        }

        // Fetch today's tasks + overdue past tasks from DB
        const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 AND (date = $2 OR (status = \'pending\' AND date < $2)) ORDER BY date ASC, sort_order ASC, id ASC', [req.session.userId, today]);
        res.json(result.rows.map(mapTask));
    } catch (err) {
        console.error('POST /tasks/init-daily error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/tasks/:id — Update properties like subtasks, tags, etc
router.put('/tasks/:id', async (req, res) => {
    const { subtasks, tags, time_est, sort_order, name } = req.body;
    try {
        const result = await pool.query(
            `UPDATE tasks SET 
                subtasks = COALESCE($1, subtasks),
                tags = COALESCE($2, tags),
                time_est = COALESCE($3, time_est),
                sort_order = COALESCE($4, sort_order),
                name = COALESCE($5, name)
             WHERE (id::text = $6 OR task_id = $6) AND user_id = $7 RETURNING *`,
            [subtasks ? JSON.stringify(subtasks) : null, tags ? JSON.stringify(tags) : null, time_est !== undefined ? time_est : null, sort_order !== undefined ? sort_order : null, name || null, req.params.id, req.session.userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.json(mapTask(result.rows[0]));
    } catch (err) {
        console.error('PUT /tasks/:id error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/tasks/reorder — Bulk update sort orders
router.post('/tasks/reorder', async (req, res) => {
    const { updates } = req.body; // [{ id, sort_order }]
    try {
        await pool.query('BEGIN');
        for (const u of updates) {
            await pool.query('UPDATE tasks SET sort_order = $1 WHERE (id::text = $2 OR task_id = $2) AND user_id = $3', [u.sort_order, u.id, req.session.userId]);
        }
        await pool.query('COMMIT');
        res.json({ ok: true });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('POST /tasks/reorder error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ---- TASK HISTORY ----

// POST /api/history
router.post('/history', async (req, res) => {
    const { task_id, name, category, status, xp_earned, xp_lost, items_earned, lost_item, armor_damage } = req.body;
    try {
        await pool.query(
            `INSERT INTO task_history (user_id, task_id, name, category, status, xp_earned, xp_lost, items_earned, lost_item, armor_damage)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [req.session.userId, task_id, name, category, status, xp_earned || 0, xp_lost || 0, JSON.stringify(items_earned || []), lost_item, armor_damage || 0]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error('POST /history error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/history
router.get('/history', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM task_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 500', [req.session.userId]);
        res.json(result.rows.map(mapHistory));
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/history/undo/:taskId
router.delete('/history/undo/:taskId', async (req, res) => {
    try {
        await pool.query(`
            DELETE FROM task_history 
            WHERE id IN (
                SELECT id FROM task_history 
                WHERE user_id = $1 AND task_id = $2 AND status = 'completed'
                ORDER BY created_at DESC LIMIT 1
            )
        `, [req.session.userId, req.params.taskId]);
        res.json({ ok: true });
    } catch (err) {
        console.error('DELETE /history/undo error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ---- DAILY DATA ----

// PUT /api/daily/:date
router.put('/daily/:date', async (req, res) => {
    const { tasks_completed, total_tasks, xp_earned, perfect } = req.body;
    try {
        await pool.query(
            `INSERT INTO daily_data (user_id, date, tasks_completed, total_tasks, xp_earned, perfect)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, date) DO UPDATE SET
         tasks_completed = EXCLUDED.tasks_completed,
         total_tasks = EXCLUDED.total_tasks,
         xp_earned = EXCLUDED.xp_earned,
         perfect = EXCLUDED.perfect`,
            [req.session.userId, req.params.date, tasks_completed || 0, total_tasks || 0, xp_earned || 0, perfect || false]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error('PUT /daily error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/daily — All daily data
router.get('/daily', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM daily_data WHERE user_id = $1 ORDER BY date DESC', [req.session.userId]);
        const data = {};
        result.rows.forEach(r => {
            data[formatDateLocal(r.date)] = {
                tasksCompleted: r.tasks_completed,
                totalTasks: r.total_tasks,
                xpEarned: r.xp_earned,
                perfect: r.perfect,
                completed: r.tasks_completed > 0,
                steps: r.steps || 0,
                calories: r.calories || 0,
                sleepScore: r.sleep_score || 0
            };
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/daily/:date/tasks — Tasks for a specific day
router.get('/daily/:date/tasks', async (req, res) => {
    try {
        await syncGoogleTasksForDate(req.session.userId, req.params.date); // Auto-sync
        const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 AND date = $2 ORDER BY sort_order ASC, id ASC', [req.session.userId, req.params.date]);
        res.json(result.rows.map(mapTask));
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/activity
router.post('/activity', async (req, res) => {
    const { type, message, emoji } = req.body;
    try {
        await pool.query(
            'INSERT INTO activity_log (user_id, type, message, emoji) VALUES ($1, $2, $3, $4)',
            [req.session.userId, type, message, emoji || '📝']
        );
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/reset — Full state reset
router.post('/reset', async (req, res) => {
    try {
        const uid = req.session.userId;
        await pool.query('BEGIN');
        await pool.query('DELETE FROM game_state WHERE user_id = $1', [uid]);
        await pool.query('DELETE FROM tasks WHERE user_id = $1', [uid]);
        await pool.query('DELETE FROM task_history WHERE user_id = $1', [uid]);
        await pool.query('DELETE FROM daily_data WHERE user_id = $1', [uid]);
        await pool.query('DELETE FROM activity_log WHERE user_id = $1', [uid]);
        await pool.query('COMMIT');
        res.json({ ok: true });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('POST /reset error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ---- Helpers ----

function mapTask(row) {
    return {
        id: row.id,
        taskId: row.task_id,
        templateId: row.template_id,
        name: row.name,
        category: row.category,
        xp: row.xp,
        rewardTier: row.reward_tier,
        priority: row.priority,
        recurring: row.recurring,
        status: row.status,
        date: row.date ? formatDateLocal(row.date) : row.date,
        completedAt: row.completed_at,
        subtasks: row.subtasks || [],
        timeEst: row.time_est || 0,
        tags: row.tags || [],
        sortOrder: row.sort_order || 0,
    };
}

function mapHistory(row) {
    return {
        id: row.id,
        taskId: row.task_id,
        name: row.name,
        category: row.category,
        status: row.status,
        xpEarned: row.xp_earned,
        xpLost: row.xp_lost,
        itemsEarned: row.items_earned,
        lostItem: row.lost_item,
        armorDamage: row.armor_damage,
        date: row.created_at,
    };
}

export default router;
