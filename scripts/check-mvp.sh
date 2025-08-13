#!/usr/bin/env bash
set -euo pipefail

API_BASE=${API_BASE:-http://localhost:3001}
PASS=0
FAIL=0
check() {
  local desc="$1"; shift
  if eval "$@" >/dev/null 2>&1; then
    echo "✅ $desc"
    PASS=$((PASS+1))
  else
    echo "❌ $desc"
    FAIL=$((FAIL+1))
  fi
}

check "healthz 200" "curl -fsS ${API_BASE}/healthz"
check "products list has items field" "curl -fsS ${API_BASE}/api/products | grep -q '"items"'"
check "rankings mostLiked has items field" "curl -fsS ${API_BASE}/api/rankings/mostLiked | grep -q '"items"'"
check "affiliate checkout 302" "curl -fsSI '${API_BASE}/api/affiliate/checkout?url=https%3A%2F%2Fexample.com%2Fproduct' | grep -q 'HTTP/1.1 302'"

# Optional: quick vote
check "post vote (optional)" "curl -fsS -X POST -H 'Content-Type: application/json' -d '{"entityType":"brand","entityId":"000000000000000000000000","weight":1}' ${API_BASE}/api/votes"

TOTAL=$((PASS+FAIL))
echo "---"
echo "Checks: $PASS/$TOTAL passed"
[ $FAIL -eq 0 ]