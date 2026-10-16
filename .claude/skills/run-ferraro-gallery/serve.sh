#!/usr/bin/env bash
# Build + start ferraro.studio locally for the driver. Run from the repo root.
#   serve.sh prod          # next build (no email env) + next start on :4180 -> forms use mailto fallback
#   serve.sh prod-email    # mock Resend on :4199 + build/start with email env -> real server-action path
#   serve.sh dev           # next dev (Turbopack, HMR) on :4180 via scripts/dev.mjs
#   serve.sh stop          # stop everything this script started
# Logs: /tmp/ferraro-server.log, /tmp/ferraro-mock-resend.log. Captured emails: /tmp/ferraro-resend.jsonl
set -euo pipefail
PORT=${PORT:-4180}
MOCK_PORT=${MOCK_PORT:-4199}
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# lsof does not see listeners in this container; fuser does, and netstat where fuser is not installed.
listeners() { netstat -ltnp 2>/dev/null | awk -v re=":($PORT|$MOCK_PORT)\$" '$4 ~ re { split($7, a, "/"); print a[1] }'; }
stop() {
  fuser -k "$PORT/tcp" "$MOCK_PORT/tcp" >/dev/null 2>&1 || listeners | xargs -r kill 2>/dev/null || true
  for _ in $(seq 40); do fuser "$PORT/tcp" >/dev/null 2>&1 || [ -n "$(listeners)" ] || return 0; sleep 0.25; done
  listeners | xargs -r kill -9 2>/dev/null || true
}

wait_up() {
  timeout 90 bash -c "until curl -sf http://localhost:$PORT/ >/dev/null; do sleep 1; done" \
    || { echo "server did not come up; tail /tmp/ferraro-server.log:"; tail -20 /tmp/ferraro-server.log; exit 1; }
  echo "up: http://localhost:$PORT"
}

case "${1:-prod}" in
  stop) stop; echo stopped ;;
  dev)
    stop
    nohup node scripts/dev.mjs --port "$PORT" >/tmp/ferraro-server.log 2>&1 &
    wait_up ;;
  prod)
    stop
    # Email mode is decided at BUILD time (work pages are SSG), so build without the email env.
    env -u RESEND_API_KEY -u ENQUIRY_TO_EMAIL npm run build >/tmp/ferraro-build.log 2>&1 \
      || { tail -30 /tmp/ferraro-build.log; exit 1; }
    nohup node_modules/.bin/next start --port "$PORT" >/tmp/ferraro-server.log 2>&1 &
    wait_up ;;
  prod-email)
    stop
    nohup node "$HERE/mock-resend.mjs" --port "$MOCK_PORT" ${MOCK_FAIL:+--fail} >/tmp/ferraro-mock-resend.log 2>&1 &
    export RESEND_BASE_URL="http://127.0.0.1:$MOCK_PORT" RESEND_API_KEY=re_local_mock \
      ENQUIRY_TO_EMAIL=harry@example.com RESEND_PRINT_WAITLIST_SEGMENT_ID=seg_local_mock
    npm run build >/tmp/ferraro-build.log 2>&1 || { tail -30 /tmp/ferraro-build.log; exit 1; }
    nohup node_modules/.bin/next start --port "$PORT" >/tmp/ferraro-server.log 2>&1 &
    wait_up ;;
  *) echo "usage: serve.sh prod|prod-email|dev|stop"; exit 2 ;;
esac
