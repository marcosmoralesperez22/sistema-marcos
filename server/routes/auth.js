// =============================================
// AUTH ROUTES - Login / Logout / Session check
// =============================================

import { Router } from 'express';
import pool from '../db.js';
import { verifyPassword } from '../security.js';

const router = Router();
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

function getAttemptKey(req, username) {
    return `${req.ip}:${String(username || '').toLowerCase()}`;
}

function isBlocked(key) {
    const record = attempts.get(key);
    if (!record) return false;

    if (Date.now() - record.firstAttempt > WINDOW_MS) {
        attempts.delete(key);
        return false;
    }

    return record.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailure(key) {
    const now = Date.now();
    const record = attempts.get(key);

    if (!record || now - record.firstAttempt > WINDOW_MS) {
        attempts.set(key, { count: 1, firstAttempt: now });
        return;
    }

    record.count += 1;
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    const attemptKey = getAttemptKey(req, username);
    if (isBlocked(attemptKey)) {
        return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
    }

    try {
        const result = await pool.query(
            'SELECT id, username, password FROM users WHERE username = $1',
            [username]
        );

        const user = result.rows[0];
        if (!user || !verifyPassword(password, user.password)) {
            recordFailure(attemptKey);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        attempts.delete(attemptKey);

        req.session.regenerate((err) => {
            if (err) {
                console.error('Session regenerate error:', err);
                return res.status(500).json({ error: 'Server error' });
            }

            req.session.userId = user.id;
            req.session.username = user.username;
            res.json({ ok: true, user: { id: user.id, username: user.username } });
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ ok: true });
    });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
    if (req.session?.userId) {
        res.json({ ok: true, user: { id: req.session.userId, username: req.session.username } });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

export default router;
