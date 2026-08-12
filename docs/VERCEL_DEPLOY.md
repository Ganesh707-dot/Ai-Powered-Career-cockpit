# Vercel deploy — CareerPilot (frontend + backend)

## Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://careerpilot-ai-omega-khaki.vercel.app |
| Backend API | https://careerpilot-api.vercel.app |

---

## Frontend project (`careerpilot-ai`)

**Settings → General**

| Setting | Value |
|---------|--------|
| Root Directory | `frontend` |
| Framework | Next.js |
| Node.js | 20.x |

**Settings → Environment Variables**

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://careerpilot-api.vercel.app` |

Frontend auto-deploys on push to `main`.

---

## Backend project (`careerpilot-api`)

**Settings → General**

| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Framework | Other |

**Settings → Environment Variables** (required for production)

Copy `GROQ_API_KEY` from your **AI Wellness** Vercel project (same Groq account).

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon Postgres connection string (see `docs/NEON_DATABASE.md`) |
| `AI_PROVIDER` | `groq` |
| `GROQ_API_KEY` | From AI Wellness Vercel project |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` |
| `CORS_ORIGINS` | `https://careerpilot-ai-omega-khaki.vercel.app` |

After adding env vars → **Deployments → Redeploy** (backend must redeploy, not just frontend).

### Verify backend is live

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

Workspace API (resumes, profile, job chat):

```bash
curl -H "X-Workspace-Id: test" https://careerpilot-api.vercel.app/api/v1/workspace/profile
```

Should return JSON profile — **not** 404.

---

## UI checklist (new build)

- Page title: **Career Cockpit**
- High-contrast dark theme (readable text)
- Mobile: bottom tab bar, Job Mentor chat — no profile popup on load
- Profile: `/profile` only (gear icon)

Hard-refresh after deploy (Ctrl+Shift+R / clear mobile cache).
