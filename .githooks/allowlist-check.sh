#!/bin/sh
# Katabasis repository allowlist enforcement  (default-deny).
#
# Validates a set of files against .allowlist in three layers, in order:
#   1. Denylist  - extensions/names that must never be committed (data dumps,
#                  source maps, secrets), independent of the allowlist.
#   2. Sentinel  - reject any file whose content names the trading system.
#                  Defense in depth against an accidental paste of a path.
#   3. Allowlist - default-deny: a file is rejected unless its path is
#                  explicitly permitted by .allowlist.
#
# Callers:
#   .githooks/pre-commit   passes the staged file list  (the real gate)
#   CI                     passes nothing -> all tracked  (a backstop)
#
# Usage:  allowlist-check.sh [file ...]      (no args -> all tracked files)

set -eu

ROOT="$(git rev-parse --show-toplevel)"
ALLOW="$ROOT/.allowlist"

if [ ! -f "$ALLOW" ]; then
  echo "FATAL: .allowlist not found at $ALLOW" >&2
  exit 2
fi

if [ "$#" -gt 0 ]; then
  files="$*"
else
  files="$(git ls-files)"
fi

# The proprietary token, assembled from fragments so that this script's own
# bytes never contain the contiguous string it scans for (otherwise the
# checker would block itself).
SENTINEL="options""_bot"

deny_match() {
  case "$1" in
    *.map)                                   return 0 ;;
    .env|.env.*|*.env)                       return 0 ;;
    *.csv|*.tsv|*.parquet|*.feather)         return 0 ;;
    *.pkl|*.pickle|*.npy|*.npz|*.h5|*.hdf5)  return 0 ;;
    *.db|*.sqlite|*.sqlite3)                 return 0 ;;
    *.ipynb)                                 return 0 ;;
    *.pem|*.key|*.p12|*.keystore)            return 0 ;;
  esac
  return 1
}

is_allowed() {
  f="$1"
  # 1. exact file match
  if grep -Fxq "file:$f" "$ALLOW"; then
    return 0
  fi
  # 2. directory + extension match
  ext="${f##*.}"
  while IFS= read -r line; do
    case "$line" in
      dir:*) ;;
      *) continue ;;
    esac
    rest="${line#dir:}"
    prefix="${rest%%:*}"
    exts="${rest#*:}"
    case "$f" in
      "$prefix"*)
        if [ "$exts" = "*" ]; then
          return 0
        fi
        for e in $exts; do
          if [ "$ext" = "$e" ]; then
            return 0
          fi
        done
        ;;
    esac
  done < "$ALLOW"
  return 1
}

violations=0
checked=0

for f in $files; do
  checked=$((checked + 1))
  if deny_match "$f"; then
    echo "  BLOCKED  [denylist]         $f"
    violations=$((violations + 1))
    continue
  fi
  if git show ":$f" 2>/dev/null | grep -Iq "$SENTINEL"; then
    echo "  BLOCKED  [sentinel]         $f   (names the trading system)"
    violations=$((violations + 1))
    continue
  fi
  if ! is_allowed "$f"; then
    echo "  BLOCKED  [not allowlisted]  $f"
    violations=$((violations + 1))
    continue
  fi
done

if [ "$violations" -gt 0 ]; then
  echo ""
  echo "Allowlist check FAILED: $violations of $checked file(s) blocked."
  echo "Nothing outside .allowlist may enter this public repo. If a file is"
  echo "legitimate, add it to .allowlist deliberately. If it leaked, do not commit."
  exit 1
fi

echo "Allowlist check passed ($checked file(s))."
exit 0
