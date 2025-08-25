#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

if [[ $# -gt 1 || ( $# -eq 1 && "$1" != "--watch" ) ]]; then
  echo "Usage: $0 [--watch]" >&2
  exit 1
fi

if [[ "${1:-}" == "--watch" ]]; then
  npm link --silent --no-audit --no-fund --loglevel=error
  trap 'npm unlink -g repoenv  --silent --loglevel=error' EXIT

  commands=()
  command_names=()
  command_colors=()

  commands+=("npx tsup --watch")
  command_names+=("cli")
  command_colors+=("cyan")

  commands+=("npx nodemon --quiet --watch . --ext ts,tsx --exec 'pnpm run build:schema:config'")
  command_names+=("schema:config")
  command_colors+=("magenta")

  commands+=("npx nodemon --quiet --watch . --ext ts,tsx --exec 'pnpm run build:schema:variables'")
  command_names+=("schema:variables")
  command_colors+=("yellow")

  IFS=, names="${command_names[*]}"
  IFS=, colors="${command_colors[*]}"
  unset IFS

  npx concurrently --kill-others-on-fail --names "$names" --prefix-colors "$colors" "${commands[@]}"
else
  npm run build:command
  npm run build:schemas
fi