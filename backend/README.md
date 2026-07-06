# Backend — CareerPilot AI

FastAPI REST API. See the [root README](../README.md) for full documentation.

## Quick Start

```bash
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py                    # optional sample data
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Structure

```
app/
├── main.py           # Entry point
├── config.py         # Settings
├── database.py       # SQLAlchemy setup
├── models/           # ORM entities
├── schemas/          # Pydantic DTOs
├── repositories/     # Data access
├── services/         # Business logic
└── routers/          # HTTP endpoints
```

See [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) for design details.
