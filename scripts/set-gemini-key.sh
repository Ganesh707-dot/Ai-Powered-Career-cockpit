#!/usr/bin/env bash
# Usage: ./scripts/set-gemini-key.sh YOUR_GEMINI_API_KEY
set -euo pipefail

KEY="${1:-}"
if [[ -z "$KEY" ]]; then
  echo "Usage: $0 YOUR_GEMINI_API_KEY"
  echo "Get a free key: https://aistudio.google.com/apikey"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"

npx vercel env rm GEMINI_API_KEY production -y >/dev/null 2>&1 || true
printf '%s' "$KEY" | npx vercel env add GEMINI_API_KEY production
npx vercel --prod --yes

echo "Done. Check: curl https://careerpilot-api.vercel.app/api/v1/ai-status"
