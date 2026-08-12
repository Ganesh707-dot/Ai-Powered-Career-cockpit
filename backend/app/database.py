from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

connect_args = {}
engine_kwargs: dict = {"pool_pre_ping": True}

if settings.is_sqlite:
    connect_args = {"check_same_thread": False}
else:
    engine_kwargs.update({"pool_size": 5, "max_overflow": 10})

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    **engine_kwargs,
)

if settings.is_sqlite:

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):  # type: ignore[no-untyped-def]
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _ensure_sqlite_columns() -> None:
    """Lightweight additive migrations for SQLite (no Alembic yet)."""
    if not settings.is_sqlite:
        return
    with engine.begin() as conn:
        cols = {
            row[1]
            for row in conn.execute(text("PRAGMA table_info(resumes)")).fetchall()
        }
        if cols:
            if "extracted_text" not in cols:
                conn.execute(text("ALTER TABLE resumes ADD COLUMN extracted_text TEXT"))
            if "original_filename" not in cols:
                conn.execute(
                    text("ALTER TABLE resumes ADD COLUMN original_filename VARCHAR(255)")
                )


def init_db():
    from app.models import (  # noqa: F401
        application,
        interview_journal,
        job_context,
        learning_topic,
        resume,
        workspace_profile,
    )

    Base.metadata.create_all(bind=engine)
    try:
        _ensure_sqlite_columns()
    except Exception:
        pass
