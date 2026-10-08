#!/usr/bin/env bash
# Verification pipeline for boilerplate/. Usage: verify.sh <boilerplate-dir> <log-file>
set -u
DIR="$1"; LOG="$2"
cd "$DIR" || exit 1
PORT=47321
STATUS=0
step() { # name, command...
  local name="$1"; shift
  echo "" >> "$LOG"; echo "===== [$(date -u +%H:%M:%SZ)] STEP: $name :: $*" >> "$LOG"
  local t0=$(date +%s.%N)
  "$@" >> "$LOG" 2>&1; local rc=$?
  printf '===== RESULT: %s exit=%d (%.1fs)\n' "$name" "$rc" "$(echo "$(date +%s.%N) - $t0" | bc)" >> "$LOG"
  echo "$name: exit=$rc"
  [ $rc -eq 0 ] || STATUS=1
  return $rc
}
{
  echo "# boilerplate verification log"
  echo "date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "node: $(node -v)  npm: $(npm -v)  docker: $(docker --version 2>/dev/null)"
  echo "uname: $(uname -srm)"
} > "$LOG"
step "clean" rm -rf node_modules dist coverage
step "install (npm ci)" npm ci --no-audit --no-fund
step "versions" bash -c 'npx tsc -v; npx tsc6 -v; npx eslint -v; npx vitest --version; node -p "require(\"fastify/package.json\").version"'
step "format:check" npm run format:check
step "typecheck" npm run typecheck
step "lint" npm run lint
step "test" npm run test:coverage
step "build" npm run build
step "dist contents" ls -la dist

echo "" >> "$LOG"; echo "===== STEP: start built server (node dist/main.js on :$PORT)" >> "$LOG"
PORT=$PORT HOST=127.0.0.1 NODE_ENV=production node --enable-source-maps dist/main.js > "$LOG.server" 2>&1 &
SPID=$!
code=000
for i in $(seq 1 40); do code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/health"); [ "$code" = 200 ] && break; sleep 0.25; done
{
  echo "curl /health -> HTTP $code body: $(curl -s http://127.0.0.1:$PORT/health)"
  echo "curl /ready  -> HTTP $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:$PORT/ready) body: $(curl -s http://127.0.0.1:$PORT/ready)"
  echo "curl POST /v1/todos -> $(curl -s -w ' HTTP %{http_code}' -X POST http://127.0.0.1:$PORT/v1/todos -H 'content-type: application/json' -d '{"title":"verify"}')"
  echo "curl GET /v1/todos/bad -> $(curl -s -w ' HTTP %{http_code}' http://127.0.0.1:$PORT/v1/todos/bad)"
} >> "$LOG"
kill -TERM $SPID; wait $SPID; src=$?
echo "server exit code after SIGTERM: $src" >> "$LOG"
echo "--- server log ---" >> "$LOG"; cat "$LOG.server" >> "$LOG"; rm -f "$LOG.server"
if [ "$code" = 200 ] && [ "$src" = 0 ]; then echo "===== RESULT: start+health exit=0" >> "$LOG"; echo "start+health: ok"; else echo "===== RESULT: start+health FAILED (code=$code exit=$src)" >> "$LOG"; echo "start+health: FAIL"; STATUS=1; fi

if docker info >/dev/null 2>&1; then
  step "docker build" docker build --progress=plain -t ts-backend-boilerplate:verify .
  step "docker image size" docker image ls ts-backend-boilerplate:verify --format '{{.Repository}}:{{.Tag}} {{.Size}}'
  echo "" >> "$LOG"; echo "===== STEP: docker run + /health" >> "$LOG"
  CID=$(docker run -d --rm -p 127.0.0.1:47322:3000 ts-backend-boilerplate:verify)
  dcode=000
  for i in $(seq 1 40); do dcode=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:47322/health); [ "$dcode" = 200 ] && break; sleep 0.25; done
  echo "container curl /health -> HTTP $dcode; user: $(docker exec $CID id -un)" >> "$LOG"
  docker stop -t 15 $CID >/dev/null; echo "container stopped (SIGTERM)" >> "$LOG"
  if [ "$dcode" = 200 ]; then echo "===== RESULT: docker run+health exit=0" >> "$LOG"; echo "docker run+health: ok"; else echo "===== RESULT: docker run+health FAILED" >> "$LOG"; STATUS=1; fi
else
  echo "docker not available: skipped" >> "$LOG"
fi
echo "" >> "$LOG"; echo "OVERALL: $([ $STATUS = 0 ] && echo PASS || echo FAIL)" >> "$LOG"
echo "OVERALL STATUS=$STATUS"
exit $STATUS
