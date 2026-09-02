#!/usr/bin/env bash
# Compare modus-template skill + reference copies between Cursor and Claude.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CURSOR_SKILL="$ROOT/.cursor/skills/modus-template/SKILL.md"
CLAUDE_SKILL="$ROOT/.claude/skills/modus-template/SKILL.md"
CURSOR_REF="$ROOT/.cursor/skills/modus-template/REFERENCE.md"
CLAUDE_REF="$ROOT/.claude/skills/modus-template/REFERENCE.md"

missing=0
for f in "$CURSOR_SKILL" "$CLAUDE_SKILL" "$CURSOR_REF" "$CLAUDE_REF"; do
  if [[ ! -f "$f" ]]; then
    echo "Missing: $f"
    missing=1
  fi
done
if [[ "$missing" -eq 1 ]]; then
  exit 1
fi

extract_from_heading() {
  awk '/^## '"$2"'$/ { found=1 } found' "$1"
}

extract_skill_shared() {
  awk '/^## Inputs contract$/ { found=1 } found' "$1"
}

diff_pair() {
  local label="$1"
  local a="$2"
  local b="$3"
  if ! diff -u "$a" "$b"; then
    echo "$label copies diverge."
    return 1
  fi
  return 0
}

TMP_A="$(mktemp)"
TMP_B="$(mktemp)"
failed=0

extract_skill_shared "$CURSOR_SKILL" > "$TMP_A"
extract_skill_shared "$CLAUDE_SKILL" > "$TMP_B"
if ! diff_pair "modus-template SKILL (from ## Inputs contract)" "$TMP_A" "$TMP_B"; then
  failed=1
fi

extract_from_heading "$CURSOR_REF" "Authority ladder" > "$TMP_A"
extract_from_heading "$CLAUDE_REF" "Authority ladder" > "$TMP_B"
if ! diff_pair "modus-template REFERENCE (from ## Authority ladder)" "$TMP_A" "$TMP_B"; then
  failed=1
fi

rm -f "$TMP_A" "$TMP_B"

if [[ "$failed" -eq 1 ]]; then
  echo "Sync .cursor and .claude modus-template SKILL.md and REFERENCE.md."
  exit 1
fi

echo "modus-template skill and reference copies are in sync."
