"""Vercel serverless entrypoint for FastAPI via Mangum."""

import os

# Ensure SQLite path is writable on Vercel
os.environ.setdefault("DATABASE_URL", "sqlite:////tmp/careerpilot.db")
os.environ.setdefault("SEED_ON_STARTUP", "true")

from mangum import Mangum

from app.database import init_db
from app.main import app

init_db()
try:
    from seed import seed

    seed()
except Exception:
    pass

handler = Mangum(app, lifespan="off")
