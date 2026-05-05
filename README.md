# Sistema-MARCOS - Gamified Life Dashboard

A personal productivity system that applies RPG mechanics to real life: quests, habits, health metrics, planning, achievements, stats and focus sessions.

Built with Vanilla JS, Node.js, Express, PostgreSQL and Docker.

## Features

| Module | Description |
| --- | --- |
| Dashboard | Smart messages, player stats, streaks and today's tasks |
| Quests | One-off tasks with XP and reward tiers |
| Habits | Daily recurring check-ins |
| Health | Steps, sleep and calories from wearable sync |
| Roadmaps | Month/year planner with an interactive node editor |
| Achievements | Zoomable skill tree unlocked by progress |
| Stats | Charts for trends, completion and streaks |
| Pomodoro | Focus timer with rewards |
| Calendar | Past-date view and optional Google Calendar events |

## Tech Stack

- Frontend: Vanilla JS SPA, Vite, custom router
- Backend: Node.js, Express REST API
- Database: PostgreSQL 16
- Auth: `express-session` plus Node `crypto.scrypt` password hashing
- Wearable: Zepp OS companion app
- Calendar: optional Google Calendar service account
- Deploy: Docker and Docker Compose

## Quick Start

### Docker

```bash
git clone https://github.com/marcosmoralesperez22/sistema-marcos.git
cd sistema-marcos
cp .env.example .env
```

Edit `.env` and set unique values for `DB_PASSWORD`, `SESSION_SECRET`, `ADMIN_USERNAME` and `ADMIN_PASSWORD`.

```bash
docker compose up --build -d
```

Open http://localhost:3000 and log in with the admin credentials from your local `.env`.

### Local Development

Requirements: Node.js 20+ and PostgreSQL 16+.

```bash
npm install
cp .env.example .env
npm run server
npm run dev
```

The Vite dev server proxies `/api` to the Express server.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `DB_HOST` | Yes | PostgreSQL host |
| `DB_PORT` | Yes | PostgreSQL port |
| `DB_NAME` | Yes | PostgreSQL database name |
| `DB_USER` | Yes | PostgreSQL user |
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `ADMIN_USERNAME` | Yes | Initial admin username |
| `ADMIN_PASSWORD` | Yes | Initial admin password, at least 12 characters |
| `SESSION_SECRET` | Yes | Random session signing secret, at least 32 characters |
| `COOKIE_SECURE` | No | Set `true` behind HTTPS |
| `TRUST_PROXY` | No | Set `true` when deployed behind a trusted reverse proxy |
| `GOOGLE_SERVICE_ACCOUNT_FILE` | No | Path to a local Google service account key outside the repo |

## Security Notes

- `.env`, PostgreSQL data, logs, local JSON keys and data dumps are ignored by Git.
- Passwords are stored as `scrypt` hashes, not plaintext.
- The login route includes a basic in-memory failed-attempt limiter.
- Sessions use HTTP-only cookies and regenerate the session ID after login.
- Do not commit Google service account keys. If a real key was ever committed or shared, revoke and rotate it in Google Cloud before publishing the repository.

## Google Calendar Integration

The Calendar module can read events from Google Calendar.

1. Enable the Google Calendar API in Google Cloud.
2. Create a service account and download its JSON key.
3. Store that key outside the repository or in a local ignored file.
4. Share the calendar with the service account email.
5. Set `GOOGLE_SERVICE_ACCOUNT_FILE` in `.env`.

The app works without this integration.

## Project Structure

```text
server/             Express API, auth, database and calendar client
src/                Frontend SPA
public/             Static assets
marcos-sync/        Zepp OS companion app
docker-compose.yml  Local Docker stack
Dockerfile          Production container
vite.config.js      Vite configuration
```

## License

MIT
