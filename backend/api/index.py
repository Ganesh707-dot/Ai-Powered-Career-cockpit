"""Vercel serverless entrypoint for FastAPI via Mangum."""

import os

# Use Neon/Postgres when DATABASE_URL is set in Vercel env.
# Fallback to /tmp SQLite only for local serverless demos without a database.
if not os.environ.get("DATABASE_URL"):
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
