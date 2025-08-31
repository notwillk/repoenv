#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

WATCH=false
if [[ $# -gt 1 || ( $# -eq 1 && "$1" != "--watch" ) ]]; then
  echo "Usage: $0 [--watch]" >&2
  exit 1
fi
[[ "${1:-}" == "--watch" ]] && WATCH=true

concurrently_pid=""

cleanup() {
  # Stop children nicely
  if [[ -n "${concurrently_pid}" ]]; then
    # Try TERM → wait → KILL
    kill -TERM "${concurrently_pid}" 2>/dev/null || true
    for _ in {1..30}; do
      kill -0 "${concurrently_pid}" 2>/dev/null || break
      sleep 0.1
    done
    kill -KILL "${concurrently_pid}" 2>/dev/null || true
  fi

  npm unlink -g repoenv --silent --loglevel=error || true
}

trap cleanup EXIT SIGTERM SIGHUP SIGINT

if $WATCH; then
  npm link --silent --no-audit --no-fund --loglevel=error

  commands=()
  names=()
  colors=()

  # tsup should exit on SIGTERM; nodemon gets explicit SIGTERM passthrough
  commands+=("npx tsup --watch")
  names+=("cli")
  colors+=("cyan")

  commands+=("npx nodemon --quiet --signal SIGTERM --watch . --ext ts,tsx --exec 'pnpm run build:schema:config'")
  names+=("schema:config")
  colors+=("magenta")

  commands+=("npx nodemon --quiet --signal SIGTERM --watch . --ext ts,tsx --exec 'pnpm run build:schema:source'")
  names+=("schema:source")
  colors+=("yellow")

  IFS=, names_joined="${names[*]}"
  IFS=, colors_joined="${colors[*]}"
  unset IFS

  # Run concurrently in background so traps can manage it
  npx concurrently \
    --kill-others \
    --kill-signal SIGTERM \
    --names "$names_joined" \
    --prefix-colors "$colors_joined" \
    "${commands[@]}" &
  concurrently_pid=$!

  # Wait for it to finish (or for signals to trigger cleanup)
  wait "${concurrently_pid}"
  concurrently_pid=""  # avoid double-kill in cleanup

else
  npm run build:command
  npm run build:schemas
fi
