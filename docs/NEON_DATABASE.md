# Enterprise database setup (Neon Postgres — free tier)

CareerPilot already has a **proper backend** (FastAPI + SQLAlchemy). Resumes, applications, profile, and job contexts belong in **Postgres**, not localStorage.

## Why data was disappearing

The Vercel API was using **ephemeral SQLite** in `/tmp`. That is fine for demos, not for production.

| Storage | Use |
|---------|-----|
| **Neon Postgres** | Resumes, applications, profile, job contexts (source of truth) |
| **Browser `workspace-id` only** | Anonymous workspace key sent as `X-Workspace-Id` header |
| **Zustand in memory** | UI cache synced from API (not persisted locally) |

---

## Step 1 — Create free Neon database

1. Go to [neon.tech](https://neon.tech) and sign up (free tier).
2. Create a project, e.g. `careerpilot`.
3. Copy the **connection string** (starts with `postgresql://`).

Example:

```
postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## Step 2 — Configure Vercel backend (`careerpilot-api`)

**Project → Settings → Environment Variables:**

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Your Neon connection string |
| `AI_PROVIDER` | `groq` |
| `GROQ_API_KEY` | Your Groq key |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` |
| `SEED_ON_STARTUP` | `true` (optional demo data) |
| `CORS_ORIGINS` | Your frontend URL |

**Important:** Use the **pooled** connection string from Neon if offered (better for serverless).

Redeploy the **backend** project after saving env vars.

---

## Step 3 — Verify

```bash
curl https://careerpilot-api.vercel.app/health
```

Expect:

```json
{
  "database": "postgres",
  "database_durable": true
}
```

Upload a resume → close browser → reopen → resume still in **Resume Intelligence**.

---

## Step 4 — Local development with Postgres

```bash
docker compose up -d
```

Uses Postgres from `docker-compose.yml`:

```
DATABASE_URL=postgresql+psycopg2://careerpilot:careerpilot@localhost:5432/careerpilot
```

---

## New API endpoints (enterprise workspace)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/workspace/profile` | Load career profile from DB |
| PUT | `/api/v1/workspace/profile` | Save profile |
| GET | `/api/v1/workspace/job-contexts` | All per-job execution contexts |
| PUT | `/api/v1/workspace/job-contexts/{key}` | Save context for one job |
| POST | `/api/v1/workspace/job-contexts/{key}/messages` | Append mentor message |

All scoped by `X-Workspace-Id` header (auto-generated once per browser).

---

## Architecture

```
Browser (Next.js)
  │  X-Workspace-Id + REST
  ▼
FastAPI
  ├── resumes, applications  → Postgres (Neon)
  ├── workspace/profile      → Postgres
  └── job_contexts           → Postgres (per application)
  ▼
Groq / Gemini (AI_PROVIDER)
```

This is the same pattern as production SaaS: **API + durable DB + in-memory UI state**.
