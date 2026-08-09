# CareerPilot AI — Personal Career Operating System

Full-stack career cockpit for software engineers: track applications, analyze JDs with AI, prepare interviews, upload resumes, follow personalized learning paths, and coach with a conversational AI mentor.

**Live app (recruiters):** https://careerpilot-ai-omega-khaki.vercel.app  
**API:** https://careerpilot-api.vercel.app · **Health:** `/health` · **Swagger:** `/docs`  
**Repo:** https://github.com/Ganesh707-dot/Ai-Powered-Career-cockpit  
**Branch:** `career-cockpit`

---

## Table of contents

1. [Product overview](#1-product-overview)
2. [Live demo & modules](#2-live-demo--modules)
3. [Technical architecture](#3-technical-architecture)
4. [AI provider layer](#4-ai-provider-layer)
5. [Local setup](#5-local-setup)
6. [Deployment](#6-deployment)
7. [User experience manual](#7-user-experience-manual)
8. [Testing guide](#8-testing-guide)
9. [Project structure](#9-project-structure)
10. [API reference](#10-api-reference)
11. [Future roadmap](#11-future-roadmap)

---

## 1. Product overview

### Why this exists

Job search for engineers usually means spreadsheets, Notion, scattered notes, and multiple resume versions. CareerPilot AI is a single **Career Operating System** for the full loop:

Track applications → Analyze JDs → Prep interviews → Journal rounds → Manage resumes → Learn gaps → Measure progress → Get AI coaching.

### What makes it “real”

| Area | Behavior |
|------|----------|
| AI | Live Gemini (swap-ready for OpenAI/GPT) — not static Q&A banks for answers |
| Personalization | Saved profile (skills, level, target role, resume) used across every AI feature |
| JD match | Score only when a real profile/resume exists — no fake 0% without data |
| UX | Latest-request wins (AbortController), cancel buttons, latency badges |
| Deploy | Production frontend + API on Vercel |

---

## 2. Live demo & modules

| Module | Route | Purpose |
|--------|-------|---------|
| Executive Dashboard | `/` | KPIs, weekly goal, activity |
| Job Search | `/jobs` | Applications CRUD, table + kanban |
| JD Intelligence | `/jd-analysis` | Personalized JD ↔ profile match |
| Interview Prep | `/interview-prep` | Gemini question packs + live answer drill |
| HR Answer Studio | `/hr-studio` | Personalized HR answers |
| AI Career Staff | `/mentor` | Conversational mentor (level → target role) |
| AI Coach | `/ai-coach` | Resume coach + career insights |
| Interview Journal | `/journal` | Round notes & lessons |
| Resume Intelligence | `/resumes` | Upload PDF/DOCX/TXT + AI coach |
| Learning | `/learning` | AI week-by-week roadmap → topics |
| Analytics | `/analytics` | Trends, conversion, skills |

---

## 3. Technical architecture

```
Browser (Next.js 15)
    │  same-origin /api/v1/*  (Next rewrites)
    ▼
FastAPI (/api/v1)  ── Router → Service → Repository → SQLite/Postgres
    │
    ▼
LLM Provider Factory
    ├── gemini  (default, free tier)
    └── openai  (swap later via env)
```

### Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui, Zustand (persist profile) |
| Backend | FastAPI, SQLAlchemy 2, Pydantic v2, httpx |
| AI | Gemini `gemini-2.0-flash-lite` (+ retries, cache, model fallbacks) |
| Files | `pypdf` / `python-docx` text extraction; content stored in DB |
| Deploy | Vercel (Next.js) + Vercel Python/Mangum (API) |
| Optional | Docker Compose (Postgres + API), Render blueprint |

### Backend layers

| Layer | Location | Role |
|-------|----------|------|
| Routers | `backend/app/routers/` | HTTP, validation |
| Services | `backend/app/services/` | Domain + AI |
| LLM | `backend/app/services/llm/` | Provider factory (gemini \| openai) |
| Repositories | `backend/app/repositories/` | DB access |
| Models / Schemas | `backend/app/models/`, `schemas/` | ORM + DTOs |

### Frontend patterns

- App Router — one route per module
- `useLatestRequest` — cancels stale AI calls so UI shows **latest** search only
- `profile-store` (Zustand + localStorage) — personalization across pages
- API client supports JSON + multipart upload + AbortSignal

### Design principles

1. **Provider-agnostic AI** — product services call `gemini_client` proxy → factory picks Gemini or OpenAI  
2. **Personalization first** — profile/resume required for realistic match scores  
3. **Fast free-tier** — short prompts, token caps, 3‑min response cache, single mentor request (no stream+chat double hit)  
4. **Clean API** — `/api/v1` versioning, OpenAPI at `/docs`

---

## 4. AI provider layer

Default: **Gemini free tier**.

To switch to OpenAI later (no feature rewrites):

```bash
# backend env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
# optional OpenAI-compatible gateway:
# OPENAI_BASE_URL=https://api.openai.com/v1
```

| Setting | Purpose |
|---------|---------|
| `AI_PROVIDER` | `gemini` (default) or `openai` |
| `GEMINI_API_KEY` | Google AI Studio key |
| `GEMINI_MODEL` | e.g. `gemini-2.0-flash-lite` |
| `OPENAI_API_KEY` | Used when provider=openai |
| `OPENAI_MODEL` | e.g. `gpt-4o-mini` |

Status endpoint: `GET /api/v1/ai-status`

---

## 5. Local setup

### Prerequisites

- Python 3.12+
- Node.js 18+
- Gemini key: https://aistudio.google.com/apikey

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# set GEMINI_API_KEY=...
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=/api/v1
# BACKEND_URL=http://localhost:8000
npm run dev
```

Open http://localhost:3000

### Docker (API + Postgres)

```bash
export GEMINI_API_KEY=your_key
docker compose up --build
```

---

## 6. Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel `careerpilot-ai` | https://careerpilot-ai-omega-khaki.vercel.app |
| Backend | Vercel `careerpilot-api` | https://careerpilot-api.vercel.app |

Frontend rewrites `/api/v1/*` → `BACKEND_URL`.

Required API env (Vercel):

- `GEMINI_API_KEY`
- `GEMINI_MODEL=gemini-2.0-flash-lite`
- `CORS_ORIGINS=https://careerpilot-ai-omega-khaki.vercel.app,http://localhost:3000`
- `DATABASE_URL` (sqlite or Postgres)
- `SEED_ON_STARTUP=true`
- `ENVIRONMENT=production`

Redeploy helper: `scripts/set-gemini-key.sh`

Also present: `render.yaml`, `docker-compose.yml`, `backend/Dockerfile`.

---

## 7. User experience manual

### First-time setup (1 minute)

1. Open the live app.  
2. Click **Set up profile** in the header.  
3. Enter:
   - Name  
   - Current level (e.g. Mid-level 2–4 YOE)  
   - Target role (e.g. Senior Full Stack Developer)  
   - Years of experience  
   - Skills (comma-separated)  
   - Optional: link an uploaded resume  
4. Click **Save personalized profile**.  

This profile is stored in the browser and reused by JD match, interview prep, HR, mentor, and learning.

### Recommended daily flow

| Step | Where | What to do |
|------|-------|------------|
| 1 | Resumes | Upload PDF/DOCX/TXT → optional **AI coach** |
| 2 | Profile | Link that resume + confirm skills |
| 3 | Jobs | Add applications; update status on kanban |
| 4 | JD Intelligence | Paste JD → **Get personalized match** |
| 5 | Interview Prep | Generate pack (3 = fastest) → expand → **Live answer drill** |
| 6 | HR Studio | Pick question → generate answers from your experience |
| 7 | AI Career Staff | Chat: “Assess me for Senior Full Stack in 6 weeks” |
| 8 | Learning | **Generate AI learning path** → work topics to Completed |
| 9 | Journal | Log each interview round |
| 10 | Analytics / Dashboard | Review conversion and activity |

### Feature tips

**JD Intelligence**

- Match % needs skills **or** resume text. Without a profile, analyze is blocked (no fake 0%).  
- Select a resume with “file ready” for deeper matching.

**Interview Prep**

- Use difficulty + count (3/6/9/12).  
- Click Generate twice quickly — only the **latest** pack is shown.  
- Practice answers in **Live answer drill** for Gemini scoring.

**AI Career Staff**

- Uses your profile (level, role, skills, resume excerpt).  
- Ask for assessment, weekly plans, or interview drills.

**Rate limits (Gemini free tier)**

- ~20 requests/minute. If you see “Rate limited… wait ~Xs”, wait and retry.  
- Identical recent requests may be served from a short server cache (faster).

---

## 8. Testing guide

### Smoke (production)

```bash
curl -s https://careerpilot-api.vercel.app/health
curl -s https://careerpilot-api.vercel.app/api/v1/ai-status
```

Expect: `"configured": true`, provider gemini (or openai if swapped).

### AI functional checks

1. **Profile** — save skills; header shows “Personalized for …”  
2. **JD** — with skills filled, paste JD → match % between 0–100 and note explains scoring  
3. **JD without skills** — button disabled / clear error (not a silent 0%)  
4. **Interview Prep** — generate React pack (count 3); change skills and regenerate → only second result  
5. **Mock drill** — answer a question → score + improvements  
6. **HR** — generate answers; cancel in-flight if needed  
7. **Mentor** — short coaching reply using your target role  
8. **Resume upload** — PDF/TXT appears with preview; AI coach runs  
9. **Learning path** — generate 6-week plan → topics appear on board  
10. **Jobs CRUD** — create/update/delete application  

### Regression / race condition

- Start Generate on Interview Prep, immediately change filters and Generate again.  
- UI must not flash older results after the newer one arrives.

### Performance expectations (approx.)

| Call | Typical |
|------|---------|
| JD analysis (with profile) | ~1.5–4s |
| Interview pack (3 Qs) | ~2–5s |
| Mentor chat | ~2–4s |

Cold starts (Vercel free) may add 1–3s.

---

## 9. Project structure

```
Ai-Powered-Career-cockpit/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── repositories/
│   │   ├── services/
│   │   │   ├── ai_client.py          # Gemini + proxy
│   │   │   ├── llm/                  # factory, openai provider, errors
│   │   │   ├── jd_analysis_service.py
│   │   │   ├── interview_prep_service.py
│   │   │   ├── mentor_service.py
│   │   │   ├── career_coach_service.py
│   │   │   ├── learning_path_service.py
│   │   │   └── file_extract.py
│   │   └── routers/
│   ├── api/index.py                  # Vercel Mangum entry
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/app/                      # routes (modules)
│   ├── src/components/
│   ├── src/stores/profile-store.ts   # personalized profile
│   ├── src/lib/api.ts
│   └── src/lib/use-latest-request.ts
├── docs/ARCHITECTURE.md
├── docker-compose.yml
├── render.yaml
├── scripts/set-gemini-key.sh
└── README.md                         # this file
```

---

## 10. API reference

Base: `/api/v1`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health (root) |
| GET | `/ai-status` | Provider + features |
| GET | `/dashboard` | Dashboard KPIs |
| GET | `/analytics` | Charts data |
| CRUD | `/applications` | Job applications |
| CRUD | `/journal` | Interview journal |
| CRUD | `/resumes` | Resume metadata |
| POST | `/resumes/upload` | Multipart file upload |
| GET | `/resumes/{id}/text` | Extracted resume text |
| CRUD | `/learning` | Learning topics |
| POST | `/jd-analysis` | Personalized JD analysis |
| POST | `/interview-prep` | Question pack |
| POST | `/mock-interview` | Score an answer |
| POST | `/hr-answers` | HR answer styles |
| GET | `/hr-questions` | HR question list |
| GET | `/interview-categories` | Categories |
| POST | `/mentor/chat` | Career mentor |
| POST | `/mentor/stream` | SSE mentor (optional) |
| POST | `/resume-coach` | Resume coaching |
| POST | `/career-insights` | Strategy insights |
| POST | `/learning/generate-path` | AI roadmap (+ persist topics) |

Interactive docs: https://careerpilot-api.vercel.app/docs

---

## 11. Future roadmap

- [x] Live Gemini AI (JD, prep, HR, mentor, resume, learning)
- [x] Personalized profile across modules
- [x] Realistic JD match (profile/resume required)
- [x] LLM provider swap (`gemini` ↔ `openai`)
- [x] Production deploy (Vercel)
- [ ] JWT auth + multi-user tenancy
- [ ] Managed Postgres (Neon) for durable multi-instance data
- [ ] Alembic migrations
- [ ] Email follow-up reminders
- [ ] Chrome extension to save jobs

---

## Author

**Ganesh** — Full Stack Developer  

- GitHub: [@Ganesh707-dot](https://github.com/Ganesh707-dot)  
- Live demo: [CareerPilot AI](https://careerpilot-ai-omega-khaki.vercel.app)  
- Repository: [Ai-Powered-Career-cockpit](https://github.com/Ganesh707-dot/Ai-Powered-Career-cockpit)

---

## License

MIT — see [LICENSE](LICENSE).
