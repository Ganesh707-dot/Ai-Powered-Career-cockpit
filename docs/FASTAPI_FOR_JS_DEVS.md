# FastAPI for JavaScript Developers — Career Cockpit

You do **not** need to become a Python expert. This backend is structured like a NestJS/Express API — routes, services, DTOs.

**Live API:** https://careerpilot-api.vercel.app/docs (Swagger)

---

## Mental model (JS → Python)

| NestJS / Express | FastAPI (this repo) |
|------------------|---------------------|
| `@Controller()` | `APIRouter` in `routers/*.py` |
| `@Get()` / `@Post()` | `@router.get` / `@router.post` |
| Service class | `services/*_service.py` |
| DTO / Zod schema | Pydantic models in `schemas/` |
| `.env` + ConfigModule | `app/config.py` Settings |
| Middleware | FastAPI dependencies `deps/` |
| Prisma | SQLAlchemy models `models/` |

---

## Entry points (only 2 you need)

| File | When |
|------|------|
| `backend/app/main.py` | Local dev — mounts all routers |
| `backend/api/index.py` | Vercel serverless — Mangum wrapper |

---

## Add a new AI endpoint (copy-paste pattern)

1. **Service** — `backend/app/services/my_feature_service.py`
   ```python
   from app.services.ai_client import gemini_client

   async def run_my_feature(prompt: str) -> str:
       return await gemini_client.chat(prompt)
   ```

2. **Route** — add to `backend/app/routers/features.py`
   ```python
   @router.post("/my-feature")
   async def my_feature(body: MyFeatureRequest):
       text = await run_my_feature(body.prompt)
       return {"result": text}
   ```

3. **Frontend** — `frontend/src/lib/api.ts`
   ```typescript
   export async function myFeature(prompt: string) {
     return postJson("/my-feature", { prompt });
   }
   ```

4. **Page** — call from any `frontend/src/app/*/page.tsx`

---

## LLM provider switch (no code change)

Vercel env on `careerpilot-api`:

```
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
```

Factory: `backend/app/services/llm/factory.py`

Check: `GET /api/v1/ai-status`

---

## Conversational features (study these)

| Feature | Service | Frontend |
|---------|---------|----------|
| Job mentor chat | `job_mentor_service.py` | `job-mentor-chat.tsx` |
| Career staff | `mentor_service.py` | `app/mentor/page.tsx` |
| JD analysis | `jd_analysis_service.py` | `app/jd-analysis/page.tsx` |
| Interview prep | `interview_prep_service.py` | `app/interview-prep/page.tsx` |

---

## Deploy flow

```bash
git add . && git commit -m "feat: ..." && git push origin main
cd backend && npx vercel --prod --yes
cd frontend && npx vercel --prod --yes
```

---

## Local test one AI call

```bash
curl -X POST https://careerpilot-api.vercel.app/api/v1/mentor/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Help me prepare for React interview","workspace_id":"demo"}'
```

---

## When interviewer asks "Why Python not NestJS?"

> "FastAPI gives typed async routes, auto OpenAPI docs, and fast cold starts on Vercel Python runtime. The frontend is 100% Next.js/TypeScript where I spend most of my time. LLM layer is provider-agnostic — same Groq key as our wellness platform."
