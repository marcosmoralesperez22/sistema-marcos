// =============================================
// AUTH ROUTES — Login / Logout / Session check
// =============================================

import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    try {
        const result = await pool.query(
            'SELECT id, username FROM users WHERE username = $1 AND password = $2',
            [username, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        req.session.userId = user.id;
        req.session.username = user.username;

        res.json({ ok: true, user: { id: user.id, username: user.username } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ ok: true });
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
