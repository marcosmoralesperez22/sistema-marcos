// =============================================
// DATABASE — PostgreSQL connection & schema
// =============================================

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'lifecraft',
  user: process.env.DB_USER || 'lifecraft',
  password: process.env.DB_PASSWORD || 'lifecraft_secret',
});

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

      -- Insert default user if not exists
      INSERT INTO users (username, password) VALUES ('Marcos', 'admin')
      ON CONFLICT (username) DO NOTHING;

      -- Insert default game state for Marcos if not exists
      INSERT INTO game_state (user_id, player, armor, settings)
      SELECT u.id,
        '{"name":"Marcos","title":"Aprendiz","level":1,"xp":0,"xpToNext":200,"health":20,"maxHealth":20,"streak":0,"bestStreak":0,"lastActiveDate":null,"totalProductiveHours":0,"totalTasksCompleted":0}'::jsonb,
        '{"helmet":{"type":"leather","durability":100,"maxDurability":100},"chestplate":{"type":"leather","durability":100,"maxDurability":100},"leggings":{"type":"leather","durability":100,"maxDurability":100},"boots":{"type":"leather","durability":100,"maxDurability":100}}'::jsonb,
        '{"difficulty":1.0,"soundEnabled":false,"fitnessStartDate":"2026-03-02"}'::jsonb
      FROM users u WHERE u.username = 'Marcos'
      ON CONFLICT (user_id) DO NOTHING;
    `);
    console.log('✅ Database schema initialized');
  } finally {
    client.release();
  }
}

export { pool };
export default pool;
