"""Vercel serverless entrypoint for FastAPI via Mangum."""

import os

if not os.environ.get("DATABASE_URL"):
    os.environ.setdefault("DATABASE_URL", "sqlite:////tmp/careerpilot.db")

# Skip heavy seed on every cold start unless explicitly enabled
os.environ.setdefault("SEED_ON_STARTUP", "false")

from mangum import Mangum

from app.database import init_db
from app.main import app

_db_ready = False


def _ensure_db():
    global _db_ready
    if _db_ready:
        return
    init_db()
    if os.environ.get("SEED_ON_STARTUP", "false").lower() in ("1", "true", "yes"):
        try:
            from seed import seed

            seed()
        except Exception:
            pass
    _db_ready = True


class LazyHandler:
    def __init__(self):
        self._handler = None

    def __call__(self, event, context):
        _ensure_db()
        if self._handler is None:
            self._handler = Mangum(app, lifespan="off")
        return self._handler(event, context)


handler = LazyHandler()
