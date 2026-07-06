#!/usr/bin/env bash
# Run this before uploading to GitHub to remove generated/local files.

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Cleaning CareerPilot AI for Git upload..."

# Remove Python virtual environment
if [ -d "$ROOT/backend/venv" ]; then
  rm -rf "$ROOT/backend/venv"
  echo "  Removed backend/venv/"
fi

# Remove local SQLite database
if [ -f "$ROOT/backend/careerpilot.db" ]; then
  rm -f "$ROOT/backend/careerpilot.db"
  echo "  Removed backend/careerpilot.db"
fi

# Remove Node artifacts (if any were generated elsewhere)
if [ -d "$ROOT/frontend/node_modules" ]; then
  rm -rf "$ROOT/frontend/node_modules"
  echo "  Removed frontend/node_modules/"
fi

if [ -d "$ROOT/frontend/.next" ]; then
  rm -rf "$ROOT/frontend/.next"
  echo "  Removed frontend/.next/"
fi

# Remove local env files (keep .env.example)
rm -f "$ROOT/frontend/.env.local" 2>/dev/null || true
rm -f "$ROOT/backend/.env" 2>/dev/null || true

echo ""
echo "Done! Folder is ready for git add."
echo "Next: update README Author section, then see docs/GIT_UPLOAD.md"
