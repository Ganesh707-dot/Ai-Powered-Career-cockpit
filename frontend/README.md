# Frontend — CareerPilot AI

Next.js 15 + React 19 + TypeScript. See the [root README](../README.md) for full documentation.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

App: http://localhost:3000

> Requires the backend running at http://localhost:8000

## Structure

```
src/
├── app/              # Pages (App Router)
├── components/
│   ├── ui/           # shadcn-style primitives
│   ├── layout/       # Sidebar, header
│   └── shared/       # Reusable feature components
├── lib/              # API client, utils
├── stores/           # Zustand state
└── types/            # TypeScript interfaces
```
