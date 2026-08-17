#!/usr/bin/env bash
# Installs the dsh-usage-deepseek plugin into the DSH web profile.
# Usage: ./install.sh [profile]   (default profile: web)
set -euo pipefail

PROFILE="${1:-web}"
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DST_DIR="$HOME/.dsh/profiles/node_modules/dsh-usage-deepseek"
PATCH_FILE="$HOME/.dsh/profiles/$PROFILE/cordis.patch.yml"

if [ ! -f "$SRC/lib/index.js" ]; then
  echo "Plugin source not found at $SRC" >&2
  exit 1
fi

# 1. copy the package into the profile module fallback
rm -rf "$DST_DIR"
mkdir -p "$DST_DIR/lib"
cp "$SRC/package.json" "$DST_DIR/package.json"
cp "$SRC/lib/index.js" "$DST_DIR/lib/index.js"
cp "$SRC/lib/logic.js" "$DST_DIR/lib/logic.js"
cp "$SRC/lib/client.js" "$DST_DIR/lib/client.js"
cp "$SRC/lib/typert.host.js" "$DST_DIR/lib/typert.host.js"
cp "$SRC/lib/typert.remote-client.js" "$DST_DIR/lib/typert.remote-client.js"
cp "$SRC/lib/index.d.ts" "$DST_DIR/lib/index.d.ts"
echo "Installed plugin => $DST_DIR"

# 2. register it in the profile patch layer (idempotent)
INSERT_BLOCK='# dsh-usage-deepseek: /usage-deepseek command + composer readout for the DeepSeek provider balance.
- insert:
    - id: deepseek-usage
      name: '"'"'dsh-usage-deepseek'"'"''

mkdir -p "$HOME/.dsh/profiles/$PROFILE"
if [ ! -f "$PATCH_FILE" ]; then
  printf '%s\n' "$INSERT_BLOCK" > "$PATCH_FILE"
  echo "Registered plugin in $PATCH_FILE"
elif grep -q "deepseek-usage" "$PATCH_FILE"; then
  echo "Plugin already registered in $PATCH_FILE"
else
  printf '%s\n' "$INSERT_BLOCK" >> "$PATCH_FILE"
  echo "Registered plugin in $PATCH_FILE"
fi

echo "Done. Restart the DSH web app. Select a DeepSeek model to see the composer readout; /usage-deepseek prints the full balance report."
