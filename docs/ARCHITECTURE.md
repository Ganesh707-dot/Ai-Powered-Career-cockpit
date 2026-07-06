# Architecture Overview

## System Design

CareerPilot AI follows a **decoupled full-stack architecture** with a Next.js frontend and FastAPI backend communicating over REST.

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
│  Next.js 15 · React 19 · TypeScript · Tailwind · Zustand    │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST / JSON
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (Port 8000)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌─────────┐ │
│  │ Routers  │→ │ Services │→ │ Repositories │→ │ SQLite  │ │
│  └──────────┘  └──────────┘  └──────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Backend — Clean Architecture

| Layer | Responsibility | Location |
|-------|----------------|----------|
| **Routers** | HTTP endpoints, request validation | `backend/app/routers/` |
| **Services** | Business logic, JD analysis, question generation | `backend/app/services/` |
| **Repositories** | Database CRUD, queries | `backend/app/repositories/` |
| **Models** | SQLAlchemy ORM entities | `backend/app/models/` |
| **Schemas** | Pydantic request/response DTOs | `backend/app/schemas/` |

### Design Patterns Used

- **Repository Pattern** — isolates data access from business logic
- **Service Layer** — encapsulates domain rules (match scoring, HR answer generation)
- **Dependency Injection** — FastAPI `Depends(get_db)` for database sessions
- **Feature-based modules** — each domain (applications, journal, resumes) has its own router, repo, and schemas

## Frontend — Feature-Based Structure

| Folder | Purpose |
|--------|---------|
| `src/app/` | Next.js App Router — one route per feature module |
| `src/components/ui/` | Reusable shadcn-style primitives (Button, Card, Dialog…) |
| `src/components/layout/` | Sidebar navigation, header, app shell |
| `src/components/shared/` | Cross-feature components (StatCard, EmptyState, StatusBadge) |
| `src/lib/` | API client, utility functions |
| `src/stores/` | Zustand global state (job applications) |
| `src/types/` | Shared TypeScript interfaces matching backend schemas |

## JD Intelligence — Extensibility

The job description analyzer uses **rule-based Python extraction** today (skill dictionaries, regex patterns). The service layer (`JDAnalysisService`) is designed as a drop-in replacement point for:

- **Ollama** (local LLM)
- **Google Gemini** (free tier)
- Any OpenAI-compatible API

No router or frontend changes required — only swap the service implementation.

## Database Schema

```
applications        interview_journals    resumes           learning_topics
─────────────       ──────────────────    ───────           ───────────────
id                  id                    id                id
company             company               name              title
role                round                 resume_type       category
status              questions_asked       target_role       status
priority            lessons_learned       skills_highlighted notes
skills_required     confidence_rating     last_updated      resources
application_date    outcome               ...
follow_up_date      ...
...
```

## API Versioning

All endpoints are prefixed with `/api/v1/` for future compatibility.

Interactive documentation: `http://localhost:8000/docs` (Swagger UI)
