#!/usr/bin/env bash
# Smoke-test the admin catalog API used by the storefront.
# Usage:
#   export NEXT_PUBLIC_API_URL='https://admin…/api/<storeId>'
#   ./scripts/verify-catalog-api.sh
# Or rely on NEXT_PUBLIC_API_URL in .env.local (parsed safely, no `source`).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -z "${NEXT_PUBLIC_API_URL:-}" ]]; then
  eval "$(python3 <<'PY'
import re
from pathlib import Path

def load(path: Path) -> str | None:
    if not path.exists():
        return None
    text = path.read_text(encoding="utf-8", errors="replace")
    for line in text.splitlines():
        m = re.match(r"^NEXT_PUBLIC_API_URL=(.*)$", line.strip())
        if not m:
            continue
        val = m.group(1).strip()
        if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
            val = val[1:-1]
        val = val.strip()
        if val:
            return val
    return None

for name in (".env.local", ".env"):
    v = load(Path(name))
    if v:
        print(f"export NEXT_PUBLIC_API_URL={v!r}")
        break
PY
)"
fi

API="${NEXT_PUBLIC_API_URL:-}"
API="${API%/}"

if [[ -z "$API" ]]; then
  echo "error: set NEXT_PUBLIC_API_URL (see .env.example)" >&2
  exit 1
fi

echo "==> GET $API/categories"
code_c="$(curl -sS -o /tmp/_cat.json -w '%{http_code}' "$API/categories" || true)"
echo "HTTP $code_c"
head -c 400 /tmp/_cat.json; echo

echo "==> GET $API/products"
code_p="$(curl -sS -o /tmp/_prod.json -w '%{http_code}' "$API/products" || true)"
echo "HTTP $code_p"
head -c 400 /tmp/_prod.json; echo

[[ "$code_c" == "200" && "$code_p" == "200" ]] || exit 1
echo OK
