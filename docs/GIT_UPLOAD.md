# Git Upload Checklist

Use this checklist before pushing to GitHub.

## Before `git add`

- [ ] Delete `backend/venv/` folder (recreate locally with `python -m venv venv`)
- [ ] Delete `backend/careerpilot.db` if present (recreate with `python seed.py`)
- [ ] Do **not** commit `node_modules/` or `.next/` (already in `.gitignore`)
- [ ] Update **Author** section in `README.md` with your name, GitHub, LinkedIn
- [ ] Add screenshots to `docs/screenshots/` (optional but recommended for recruiters)

## Initialize Git

```bash
cd CareerPilot-AI   # or your folder name
git init
git add .
git status          # verify no venv, node_modules, or .db files are staged
git commit -m "Initial commit: CareerPilot AI full-stack career management platform"
```

## Push to GitHub

```bash
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/careerpilot-ai.git
git branch -M main
git push -u origin main
```

## After clone (on any machine)

```bash
# Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python seed.py
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend && npm install && cp .env.example .env.local
npm run dev
```

## Suggested GitHub Repository Settings

- **Name:** `careerpilot-ai`
- **Description:** Personal Career Operating System for Software Engineers — job tracking, interview prep, JD analysis, analytics
- **Topics:** `nextjs` `react` `typescript` `fastapi` `python` `fullstack` `saas` `career` `interview-prep` `portfolio-project`
- **Visibility:** Public
