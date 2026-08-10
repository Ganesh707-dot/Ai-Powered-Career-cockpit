# Vercel deploy (CareerPilot frontend)

The live site will stay on the **old UI** (Executive Dashboard, “Set up profile” popup) until Vercel successfully builds from `main`.

## One-time project settings

In [Vercel Dashboard](https://vercel.com) → your project → **Settings → General**:

| Setting | Value |
|---------|--------|
| **Root Directory** | `frontend` |
| **Framework Preset** | Next.js |
| **Node.js Version** | 20.x |

## Redeploy latest code

1. **Deployments** tab → **Redeploy** on the latest commit (`49292cc` or newer).
2. If build fails, open the log — fix errors, push again.
3. After success, hard-refresh the site (or clear cache on mobile).

## Verify new build is live

New builds show:

- Page title: **Career Cockpit** (not “Executive Dashboard”)
- Mobile: bottom tab bar, Job Mentor chat — **no profile popup on load**
- Profile: optional **/profile** page only (gear icon)

## Repo layout

```
/                 ← monorepo root (backend + frontend)
/frontend         ← Vercel Root Directory must point here
/frontend/vercel.json
/vercel.json      ← fallback if Root Directory is repo root
```

## Backend API

Set in Vercel → **Environment Variables**:

- `NEXT_PUBLIC_BACKEND_URL` = your Render/FastAPI URL (e.g. `https://careerpilot-api.onrender.com`)

Without this, the UI loads but API calls may fail locally in dev only; production rewrites use `BACKEND_URL` / `NEXT_PUBLIC_BACKEND_URL`.
