import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db
from app.routers import applications, features, journal, learning, resumes, workspace
from app.services.llm.errors import AIConfigurationError, AIProviderError

logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))
logger = logging.getLogger("careerpilot")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    if settings.seed_on_startup:
        try:
            from seed import seed

            seed()
            logger.info("Database seed check complete")
        except Exception:
            logger.exception("Seed skipped or failed")
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Personal Career Operating System for Software Engineers — Gemini-powered",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workspace.router, prefix="/api/v1")
app.include_router(applications.router, prefix="/api/v1")
app.include_router(journal.router, prefix="/api/v1")
app.include_router(resumes.router, prefix="/api/v1")
app.include_router(learning.router, prefix="/api/v1")
app.include_router(features.router, prefix="/api/v1")


@app.exception_handler(AIConfigurationError)
async def ai_config_handler(_: Request, exc: AIConfigurationError):
    return JSONResponse(status_code=503, content={"detail": str(exc)})


@app.exception_handler(AIProviderError)
async def ai_provider_handler(_: Request, exc: AIProviderError):
    status = 429 if "Rate limited" in str(exc) or "429" in str(exc) else 502
    return JSONResponse(status_code=status, content={"detail": str(exc)})



@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "ai_provider": settings.ai_provider if settings.ai_enabled else "unconfigured",
        "database": "sqlite" if settings.is_sqlite else "postgres",
        "database_durable": not settings.is_sqlite,
    }
