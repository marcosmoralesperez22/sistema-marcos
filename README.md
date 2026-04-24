# Sistema-MARCOS — Gamified Life Dashboard

A personal productivity system that applies RPG game mechanics to real life. Complete quests, build habits, track health metrics from your smartwatch, and watch your character level up as you become more productive.

Built with Vanilla JS + Node.js + PostgreSQL + Docker.

---

## What it does

| Module | Description |
|--------|-------------|
| **Dashboard** | Smart messages, player stats (HP, XP, Level, Streak), today's tasks at a glance |
| **Quests** | One-off tasks that reward XP and Aura points on completion |
| **Habits** | Daily recurring check-ins with auto-check from wearable data |
| **Health** | Biometric data from Amazfit smartwatch (steps, sleep, calories) |
| **Roadmaps** | Visual month/year planner with an interactive node editor |
| **Achievements** | Zoomable, pannable skill tree that unlocks based on your history |
| **Stats** | Charts showing Aura trends, mission completion rate, and discipline streaks |
| **Pomodoro** | Focus timer that rewards Aura on successful sessions |
| **Calendar** | Time machine — see what you did on any past date |

---

## Tech stack

- **Frontend**: Vanilla JS SPA, Vite bundler, custom router, no framework
- **Backend**: Node.js + Express REST API
- **Database**: PostgreSQL 16
- **Auth**: express-session with bcrypt
- **Wearable**: Zepp OS app for Amazfit watches (syncs steps, sleep, calories via HTTP)
- **Calendar**: Google Calendar API (optional, via service account)
- **Deploy**: Docker + Docker Compose

---

## Quick start

### Option A — Docker (recommended)

```bash
git clone https://github.com/marcosmoralesperez22/sistema-marcos.git
cd sistema-marcos

# Copy and edit environment variables
cp .env.example .env
# Edit .env with your own secrets

# Build and start everything
docker compose up --build -d
```

Open http://localhost:3000 and log in with **Marcos / admin** (change this immediately in the DB or via the settings page).

### Option B — Local development

**Requirements**: Node.js 20+, PostgreSQL 16+

```bash
git clone https://github.com/marcosmoralesperez22/sistema-marcos.git
cd sistema-marcos

npm install
cp .env.example .env
# Edit .env — set DB_* vars to point to your local Postgres instance

# Terminal 1: start the backend
npm run server

# Terminal 2: start the frontend dev server
npm run dev
```

---

## Environment variables

See [`.env.example`](.env.example) for the full list.

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_HOST` | Yes | PostgreSQL host |
| `DB_PORT` | Yes | PostgreSQL port (default 5432) |
| `DB_NAME` | Yes | Database name |
| `DB_USER` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password |
| `SESSION_SECRET` | Yes | Random string for session signing |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | No | Full JSON of your Google service account (for Calendar) |
| `GOOGLE_SERVICE_ACCOUNT_FILE` | No | Path to your service account JSON file (never commit this) |

---

## Google Calendar integration (optional)

The dashboard can pull events from Google Calendar to show them in the Calendar view.

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Google Calendar API**
3. Create a **Service Account** and download the JSON key
4. Share your calendar with the service account email
5. Set `GOOGLE_SERVICE_ACCOUNT_JSON` in your `.env` (paste the full JSON as a one-liner)

The app works fine without this — the Calendar module just won't show Google events.

---

## Zepp OS watch app

The `zepp-sync-app/` folder contains the companion app for **Amazfit** watches running Zepp OS 3+. It reads steps, calories and sleep data from the watch sensors and POSTs them to `/api/zepp/sync` so the dashboard stays updated automatically.

### Deploy to watch

1. Install [Zepp Dev Tools](https://docs.zepp.com/docs/watchface/tools/simulator/)
2. Open `zepp-sync-app/` in the editor
3. Set your dashboard URL in `zepp-sync-app/app.json` → `serverUrl`
4. Build and install on your watch

---

## Project structure

```
├── server/
│   ├── index.js          # Express entry point
│   ├── db.js             # PostgreSQL pool + schema init
│   ├── calendar.js       # Google Calendar client
│   └── routes/
│       ├── api.js        # Game state CRUD, Zepp sync
│       └── auth.js       # Login / logout
├── src/
│   ├── main.js           # Frontend entry point
│   ├── router.js         # Client-side SPA router
│   ├── data/store.js     # Global state + localStorage sync
│   ├── components/       # Sidebar, right panel, etc.
│   └── pages/            # One file per route
├── zepp-sync-app/        # Amazfit watch application
├── docker-compose.yml
├── Dockerfile
└── vite.config.js
```

---

## How to adapt it for yourself

This system is built around my personal workflow, but you can fork it and make it yours:

- **Change the default user**: edit the `INSERT INTO users` seed in `server/db.js`
- **Add quest categories**: they're defined in `src/data/` — fully customizable
- **Tweak XP formulas**: look for `xp` and `aura` calculations in `src/pages/`
- **Add new achievements**: `src/pages/achievements.js` has the full tree — add a new node and a `checkAllAchievements()` rule
- **Different wearable**: replace `zepp-sync-app/` with any device that can POST JSON to `/api/zepp/sync`

---

## Ideas for improvement / contributions welcome

- [ ] Multi-user support (currently single-user only)
- [ ] Mobile-responsive layout
- [ ] Notifications / reminders (push or email)
- [ ] Export data to CSV / JSON
- [ ] Dark/light theme toggle
- [ ] Plugin system for custom modules
- [ ] Public API so other apps can read your stats
- [ ] iOS / Android companion app

If you build any of these, PRs are welcome!

---

## License

MIT — do whatever you want with it.
