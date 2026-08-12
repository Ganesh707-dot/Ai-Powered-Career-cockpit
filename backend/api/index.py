"""Vercel serverless entrypoint for FastAPI via Mangum."""

import os

if not os.environ.get("DATABASE_URL"):
    os.environ.setdefault("DATABASE_URL", "sqlite:////tmp/careerpilot.db")

os.environ.setdefault("SEED_ON_STARTUP", "false")
os.environ.setdefault("VERCEL", "1")

from mangum import Mangum

from app.database import init_db
from app.main import app

init_db()

handler = Mangum(app, lifespan="off")
