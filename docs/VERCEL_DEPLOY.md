# Vercel deploy — CareerPilot (frontend + backend)

## Live URLs

| Service | Production URL |
|---------|----------------|
| Frontend | https://careerpilot-ai-omega-khaki.vercel.app |
| Backend API | https://careerpilot-api.vercel.app |
| AI Wellness | https://maha-ai-wellness.vercel.app |

**Vercel team:** `ganesh-v`

---

## Frontend — `careerpilot-ai`

### Project settings

| Setting | Value |
|---------|--------|
| Root Directory | `frontend` |
| Framework | Next.js |
| Node.js | 20.x+ |

### Environment variables (Production)

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://careerpilot-api.vercel.app` |

### Deploy

```bash
cd frontend
npx vercel link --project careerpilot-ai
npx vercel deploy --prod --yes
```

Auto-deploys on push to `main` when GitHub is connected.

---

## Backend — `careerpilot-api`

### Project settings

| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Framework | Other (Python serverless) |

### Environment variables (Production)

| Variable | Value | Notes |
|----------|--------|--------|
| `DATABASE_URL` | Neon Postgres connection string | Required for durable data. See `docs/NEON_DATABASE.md`. Without this, API falls back to ephemeral SQLite in `/tmp`. |
| `AI_PROVIDER` | `groq` | Use Groq for AI features |
| `GROQ_API_KEY` | Your Groq API key (`gsk_...`) | Same key as wellness project |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Fast Groq model |
| `CORS_ORIGINS` | `https://careerpilot-ai-omega-khaki.vercel.app,https://careerpilot-ai-ganesh-v.vercel.app` | Comma-separated frontend URLs |
| `ENVIRONMENT` | `production` | Optional |
| `SEED_ON_STARTUP` | `true` | Optional demo seed data |

Legacy (optional fallback):

| Variable | Value |
|----------|--------|
| `GEMINI_API_KEY` | Only if `AI_PROVIDER=gemini` |
| `GEMINI_MODEL` | `gemini-2.0-flash-lite` |

### Deploy

```bash
cd backend
npx vercel link --project careerpilot-api
npx vercel deploy --prod --yes
```

**Important:** After changing env vars, redeploy the backend (env changes are not applied to running deployments automatically in all cases).

---

## AI Wellness — `maha-ai-wellness`

### Environment variables (Production)

| Variable | Value |
|----------|--------|
| `GROQ_API_KEY` | Same Groq key as CareerPilot backend |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` |

### Update Groq key (both projects)

```bash
# CareerPilot API
cd backend
npx vercel env add GROQ_API_KEY production --value "YOUR_GROQ_KEY" --sensitive --yes --force
npx vercel deploy --prod --yes

# AI Wellness
npx vercel env add GROQ_API_KEY production --project maha-ai-wellness --value "YOUR_GROQ_KEY" --sensitive --yes --force
npx vercel deploy --prod --yes --project maha-ai-wellness
```

Never commit API keys to git. Store only in Vercel env vars.

---

## Verify production

### Backend health

```bash
curl https://careerpilot-api.vercel.app/health
```

Expected when fully configured:

```json
{
  "status": "healthy",
  "ai_provider": "groq",
  "database": "postgres",
  "database_durable": true
}
```

If `database` is `sqlite`, set `DATABASE_URL` to Neon Postgres and redeploy.

### Workspace API

```bash
curl -H "X-Workspace-Id: test" https://careerpilot-api.vercel.app/api/v1/workspace/profile
```

Should return JSON profile — not 404.

### Frontend

Open https://careerpilot-ai-omega-khaki.vercel.app — hard refresh (Ctrl+Shift+R).

- Title: **Career Cockpit**
- Mobile: bottom tabs, Job Mentor chat
- High-contrast dark UI

---

## Architecture

```
Browser (Next.js)
  │  X-Workspace-Id header
  ▼
careerpilot-api.vercel.app (FastAPI)
  ├── Postgres (Neon) — resumes, profile, job contexts
  └── Groq — AI mentor, JD analysis, coaching
```
