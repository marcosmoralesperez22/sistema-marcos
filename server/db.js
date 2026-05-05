// =============================================
// DATABASE - PostgreSQL connection & schema
// =============================================

import pg from 'pg';
import { hashPassword, isPasswordHash, validatePasswordPolicy } from './security.js';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'lifecraft',
  user: process.env.DB_USER || 'lifecraft',
  password: process.env.DB_PASSWORD,
});

async function seedInitialUser(client) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username && !password) {
    console.warn('[Auth] ADMIN_USERNAME/ADMIN_PASSWORD are not configured. Skipping default user seed.');
    return;
  }

  if (!username || !password) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be provided together.');
  }

  if (!validatePasswordPolicy(password)) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');
  }

  await client.query(
    `INSERT INTO users (username, password)
     VALUES ($1, $2)
     ON CONFLICT (username) DO NOTHING`,
    [username, hashPassword(password)]
  );

  await client.query(
    `INSERT INTO game_state (user_id, player, armor, settings)
     SELECT u.id,
       jsonb_build_object(
         'name', u.username,
         'title', 'Aprendiz',
         'level', 1,
         'xp', 0,
         'xpToNext', 200,
         'health', 20,
         'maxHealth', 20,
         'streak', 0,
         'bestStreak', 0,
         'lastActiveDate', NULL,
         'totalProductiveHours', 0,
         'totalTasksCompleted', 0
       ),
       '{"helmet":{"type":"leather","durability":100,"maxDurability":100},"chestplate":{"type":"leather","durability":100,"maxDurability":100},"leggings":{"type":"leather","durability":100,"maxDurability":100},"boots":{"type":"leather","durability":100,"maxDurability":100}}'::jsonb,
       '{"difficulty":1.0,"soundEnabled":false,"fitnessStartDate":"2026-03-02"}'::jsonb
     FROM users u
     WHERE u.username = $1
     ON CONFLICT (user_id) DO NOTHING`,
    [username]
  );
}

async function migratePlaintextPasswords(client) {
  const result = await client.query('SELECT id, username, password FROM users');
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  for (const user of result.rows) {
    if (isPasswordHash(user.password)) continue;

    const replacementPassword =
      adminUsername && adminPassword && user.username === adminUsername
        ? adminPassword
        : user.password;

    await client.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashPassword(replacementPassword), user.id]
    );
  }
}

// Initialize schema
export async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS game_state (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        player JSONB NOT NULL DEFAULT '{}',
        armor JSONB NOT NULL DEFAULT '{}',
        amulets JSONB NOT NULL DEFAULT '[]',
        inventory JSONB NOT NULL DEFAULT '{}',
        achievements JSONB NOT NULL DEFAULT '{}',
        settings JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        task_id VARCHAR(255) NOT NULL,
        template_id VARCHAR(255),
        name VARCHAR(500) NOT NULL,
        category VARCHAR(100) NOT NULL,
        xp INTEGER DEFAULT 0,
        reward_tier VARCHAR(50) DEFAULT 'common',
        priority VARCHAR(20) DEFAULT 'normal',
        recurring VARCHAR(20) DEFAULT 'none',
        status VARCHAR(20) DEFAULT 'pending',
        date DATE NOT NULL,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS task_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        task_id VARCHAR(255),
        name VARCHAR(500),
        category VARCHAR(100),
        status VARCHAR(20),
        xp_earned INTEGER DEFAULT 0,
        xp_lost INTEGER DEFAULT 0,
        items_earned JSONB DEFAULT '[]',
        lost_item VARCHAR(255),
        armor_damage INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS daily_data (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        tasks_completed INTEGER DEFAULT 0,
        total_tasks INTEGER DEFAULT 0,
        xp_earned INTEGER DEFAULT 0,
        perfect BOOLEAN DEFAULT FALSE,
        steps INTEGER DEFAULT 0,
        calories INTEGER DEFAULT 0,
        sleep_score INTEGER DEFAULT 0,
        UNIQUE(user_id, date)
      );

      ALTER TABLE daily_data ADD COLUMN IF NOT EXISTS steps INTEGER DEFAULT 0;
      ALTER TABLE daily_data ADD COLUMN IF NOT EXISTS calories INTEGER DEFAULT 0;
      ALTER TABLE daily_data ADD COLUMN IF NOT EXISTS sleep_score INTEGER DEFAULT 0;

      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]';
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS time_est INTEGER DEFAULT 0;
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50),
        message TEXT,
        emoji VARCHAR(10),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await migratePlaintextPasswords(client);
    await seedInitialUser(client);

    console.log('Database schema initialized');
  } finally {
    client.release();
  }
}

export { pool };
export default pool;
