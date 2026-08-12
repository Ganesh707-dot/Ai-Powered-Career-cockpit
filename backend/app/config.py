from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _normalize_database_url(url: str) -> str:
    """Render/Heroku style postgres:// → SQLAlchemy psycopg2 URL."""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg2://", 1)
    if url.startswith("postgresql://") and "+psycopg2" not in url:
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


def _parse_origins(value: str) -> list[str]:
    raw = value.strip()
    if not raw:
        return []
    if raw.startswith("["):
        import json

        parsed = json.loads(raw)
        return [str(item).strip() for item in parsed if str(item).strip()]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "CareerPilot AI"
    app_version: str = "2.0.0"
    environment: str = "development"
    database_url: str = "sqlite:///./careerpilot.db"
    # Stored as string so Vercel/Render env vars don't need JSON encoding
    cors_origins: str = (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "https://careerpilot-ai-omega-khaki.vercel.app,"
        "https://careerpilot-ai.vercel.app"
    )
    # AI provider: "gemini" | "groq" | "openai"
    ai_provider: str = "gemini"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash-lite"
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_base_url: str = "https://api.openai.com/v1"
    seed_on_startup: bool = True
    log_level: str = "INFO"

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_db_url(cls, value: object) -> object:
        if isinstance(value, str):
            return _normalize_database_url(value.strip())
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return _parse_origins(self.cors_origins)

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")

    @property
    def gemini_enabled(self) -> bool:
        return bool(self.gemini_api_key.strip())

    @property
    def ai_enabled(self) -> bool:
        provider = (self.ai_provider or "gemini").strip().lower()
        if provider == "openai":
            return bool(self.openai_api_key.strip())
        if provider == "groq":
            return bool(self.groq_api_key.strip())
        return bool(self.gemini_api_key.strip())


settings = Settings()
