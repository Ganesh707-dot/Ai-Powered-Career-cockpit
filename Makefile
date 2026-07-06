.PHONY: backend frontend seed install-backend install-frontend dev

backend:
	cd backend && ./venv/bin/uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

seed:
	cd backend && ./venv/bin/python seed.py

install-backend:
	cd backend && python3 -m venv venv && ./venv/bin/pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

install: install-backend install-frontend

dev:
	@echo "Run 'make backend' and 'make frontend' in separate terminals"
