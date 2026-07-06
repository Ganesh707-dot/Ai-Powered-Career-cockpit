# CareerPilot AI

**A Personal Career Operating System for Software Engineers**

CareerPilot AI is a full-stack SaaS-style web application that helps developers manage their entire job search lifecycle — from tracking applications and analyzing job descriptions to preparing for interviews and measuring career progress through analytics.

Built as a production-quality portfolio project demonstrating real-world full-stack engineering skills.

---

## Why I Built This

During an active job search, developers juggle spreadsheets, Notion pages, random notes, and multiple resume versions across dozens of applications. There is no single workspace designed specifically for **software engineer interview preparation**.

CareerPilot AI solves this by combining:

- Job application tracking (Kanban + table views)
- Rule-based job description intelligence
- Interview question banks with evaluation criteria
- HR answer personalization
- Interview journaling as a searchable knowledge base
- Multi-version resume management
- Learning progress tracking
- Career analytics dashboards

This is **not a demo** — it is architected and built to be used daily during a real job search.

---

## Live Demo & Screenshots

> After cloning, run locally (see [Setup](#setup--installation) below).
>
> **Recommended:** Add 2–3 screenshots to a `docs/screenshots/` folder and link them here before sharing with recruiters:
>
> ```
> docs/screenshots/dashboard.png
> docs/screenshots/jobs-kanban.png
> docs/screenshots/jd-analysis.png
> ```

| Module | Route |
|--------|-------|
| Executive Dashboard | `/` |
| Job Search Workspace | `/jobs` |
| JD Intelligence | `/jd-analysis` |
| Interview Prep Center | `/interview-prep` |
| HR Answer Studio | `/hr-studio` |
| Interview Journal | `/journal` |
| Resume Intelligence | `/resumes` |
| Learning Dashboard | `/learning` |
| Analytics | `/analytics` |

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 15** | App Router, SSR-ready React framework |
| **React 19** | UI component library |
| **TypeScript** | Strict typing across the entire frontend |
| **Tailwind CSS** | Utility-first styling, dark mode |
| **shadcn/ui** | Accessible, composable UI primitives (Radix-based) |
| **Zustand** | Lightweight global state management |
| **React Hook Form + Zod** | Form handling and validation |
| **TanStack Table** | Data table rendering (Job Search) |
| **Recharts** | Analytics charts and visualizations |
| **Lucide Icons** | Consistent icon system |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance async Python API |
| **SQLAlchemy 2.0** | ORM with declarative models |
| **Pydantic v2** | Request/response validation and settings |
| **SQLite** | Embedded database (zero-config, portable) |
| **Uvicorn** | ASGI server |

### Architecture
- Clean Architecture (Router → Service → Repository → Model)
- Repository Pattern for data access
- Feature-based modular design
- REST API with OpenAPI/Swagger auto-docs
- CORS-configured for local development

---

## Features

### 1. Executive Dashboard
Central command center showing:
- Total applications, today's applications, interviews scheduled
- Offers, rejections, follow-ups due
- Weekly application goal with progress bar
- Recent activity feed
- Upcoming interviews
- Quick action shortcuts

### 2. Job Search Workspace
Full CRUD job application manager with:
- Company, role, salary, location, work mode (Remote/Hybrid/Onsite)
- Source tracking (LinkedIn, Naukri, Indeed, Wellfound, Instahyre, etc.)
- Priority levels, status pipeline, tags, notes
- Application and follow-up dates
- **Table view** with search, filter, and sort
- **Kanban board** with drag-friendly status columns

### 3. Job Description Intelligence
Paste any JD and get instant analysis:
- Extracted technical skills, soft skills, databases, cloud, DevOps
- Match score against your skill set
- Strength areas and missing skills
- Resume tailoring suggestions
- Interview focus topics
- Learning recommendations

*Implemented with rule-based Python analysis — architecture ready for Ollama/Gemini integration without API changes.*

### 4. Interview Preparation Center
40+ curated questions across 12 categories:
- HR, Behavioral, JavaScript, TypeScript, React, Next.js
- Node.js, REST APIs, Databases, System Design, Performance, Security

Each question includes:
- Expected answer outline
- Evaluation criteria
- Difficulty level (Easy / Medium / Hard)

### 5. HR Answer Studio
Personalized HR interview answers for 9 common questions:
- Tell me about yourself
- Why leaving current company
- Why should we hire you
- Biggest achievement / challenge
- Leadership, conflict resolution, career goals, salary expectations

Generates **multiple answer styles** (concise, detailed, storytelling) customized with your real experience.

### 6. Interview Journal
Post-interview logging and knowledge base:
- Company, round, interviewer, questions asked
- Your answers vs. better answers
- Feedback, mistakes, lessons learned
- Confidence rating (1–10), outcome
- Full-text search across entries

### 7. Resume Intelligence
Manage multiple resume versions:
- React, Next.js, Angular, Full Stack, AI, Custom types
- Target role, skills highlighted, notes, last updated date

### 8. Learning Dashboard
Track interview prep topics:
- Categories: JavaScript, TypeScript, React, Next.js, Angular, Node.js, SQL, System Design, DSA
- Status workflow: Planned → In Progress → Completed
- Overall progress visualization

### 9. Analytics
Data-driven career insights with Recharts:
- Application trends (30-day line chart)
- Status distribution (pie chart)
- Weekly progress (bar chart)
- Interview conversion rate and offer rate
- Most requested skills from your applications
- Companies applied list

---

## Project Structure

```
CareerPilot-AI/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── main.py             # App entry point, CORS, router registration
│   │   ├── config.py           # Settings (Pydantic BaseSettings)
│   │   ├── database.py         # SQLAlchemy engine, session, init_db
│   │   ├── models/             # ORM models (Application, Journal, Resume, Learning)
│   │   ├── schemas/            # Pydantic request/response DTOs
│   │   ├── repositories/       # Data access layer
│   │   ├── services/           # Business logic (JD analysis, interview prep, analytics)
│   │   └── routers/            # API route handlers
│   ├── seed.py                 # Sample data for demo/testing
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                   # Next.js 15 React frontend
│   ├── src/
│   │   ├── app/                # App Router pages (one per module)
│   │   ├── components/
│   │   │   ├── ui/             # shadcn-style primitives
│   │   │   ├── layout/         # Sidebar, header, app shell
│   │   │   └── shared/         # StatCard, EmptyState, StatusBadge, etc.
│   │   ├── lib/                # API client, utilities
│   │   ├── stores/             # Zustand state
│   │   └── types/              # TypeScript interfaces
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── docs/
│   └── ARCHITECTURE.md         # Detailed architecture documentation
│
├── Makefile                    # Convenience commands
├── LICENSE                     # MIT License
└── README.md                   # This file
```

---

## API Endpoints

Base URL: `http://localhost:8000/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Dashboard KPIs and activity |
| GET | `/analytics` | Analytics data for charts |
| GET/POST | `/applications` | List / create applications |
| GET/PATCH/DELETE | `/applications/{id}` | Read / update / delete |
| GET/POST | `/journal` | Interview journal entries |
| GET/POST | `/resumes` | Resume versions |
| GET/POST | `/learning` | Learning topics |
| POST | `/jd-analysis` | Analyze a job description |
| POST | `/interview-prep` | Generate interview questions |
| POST | `/hr-answers` | Generate HR answer styles |
| GET | `/hr-questions` | List available HR questions |
| GET | `/interview-categories` | List question categories |
| GET | `/health` | Health check |

Full interactive docs: **http://localhost:8000/docs**

---

## Setup & Installation

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm** (for frontend only)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/careerpilot-ai.git
cd careerpilot-ai
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # optional
python seed.py                  # load sample data (6 apps, journals, resumes)
uvicorn app.main:app --reload --port 8000
```

Backend runs at **http://localhost:8000**

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs at **http://localhost:3000**

### Quick commands (Makefile)

```bash
make install-backend    # Create venv + install Python deps
make install-frontend   # npm install
make seed               # Load sample data
make backend            # Start FastAPI server
make frontend           # Start Next.js dev server
```

---

## What This Project Demonstrates

For recruiters and hiring managers reviewing this repository:

| Skill Area | Evidence in Codebase |
|------------|---------------------|
| **Full-Stack Development** | Complete Next.js + FastAPI application with 9 feature modules |
| **Clean Architecture** | Repository pattern, service layer, separation of concerns |
| **TypeScript Proficiency** | Strict types, shared interfaces, Zod validation |
| **Modern React** | React 19, App Router, client/server components, hooks |
| **API Design** | RESTful endpoints, Pydantic schemas, OpenAPI docs, proper HTTP status codes |
| **Database Modeling** | SQLAlchemy ORM, relationships, enums, migrations-ready structure |
| **UI/UX Design** | Dark-mode SaaS UI inspired by Linear/Vercel, responsive layout, empty/loading states |
| **State Management** | Zustand store + React Hook Form for complex forms |
| **Data Visualization** | Recharts integration for analytics dashboards |
| **Business Logic** | Rule-based JD parser, interview question bank, HR answer templating |
| **Production Practices** | Error handling, CORS, env config, .gitignore, seed data, documentation |

---

## Future Enhancements

- [ ] Ollama / Gemini integration for AI-powered JD analysis
- [ ] User authentication (JWT)
- [ ] PostgreSQL migration for production deployment
- [ ] Docker Compose for one-command setup
- [ ] Email follow-up reminders
- [ ] Chrome extension to save jobs from LinkedIn
- [ ] PDF resume upload and parsing
- [ ] Deployment to Vercel (frontend) + Railway/Render (backend)

---

## Author

**Your Name** — Senior Full Stack Developer

- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/your-profile)
- Portfolio: [your-portfolio.com](https://your-portfolio.com)

> Replace the links above with your actual profiles before publishing.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with Next.js, FastAPI, and TypeScript — designed for developers, by a developer.
</p>
