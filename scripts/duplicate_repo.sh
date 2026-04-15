#!/usr/bin/env zsh
# Lightweight repo duplication helper for local cloning + reinit
# Usage: ./scripts/duplicate_repo.sh <new-name> [new-remote-url]

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <new-directory-name> [new-remote-git-url]"
  exit 2
fi

NEW_NAME=$1
NEW_REMOTE=${2:-}

ROOT_DIR=$(pwd)
DEST_DIR=$(dirname "$ROOT_DIR")/$NEW_NAME

echo "Source repo: $ROOT_DIR"
echo "Destination: $DEST_DIR"

if [ -e "$DEST_DIR" ]; then
  echo "Error: destination $DEST_DIR already exists. Choose a different name or remove it." >&2
  exit 3
fi

echo "Copying files (excluding common heavy/volatile dirs)..."
rsync -a --exclude='.git' --exclude='node_modules' --exclude='venv' --exclude='dist' --exclude='__pycache__' --exclude='.pytest_cache' --exclude='build' "$ROOT_DIR/" "$DEST_DIR/"

cd "$DEST_DIR"

echo "Removing any lingering .git metadata (if present) and reinitializing..."
rm -rf .git || true
git init
git add -A
git commit -m "Initial commit (duplicated from ${PWD##*/})"

if [ -n "$NEW_REMOTE" ]; then
  git remote add origin "$NEW_REMOTE"
  echo "Added remote origin: $NEW_REMOTE"
fi

# Try to update frontend package.json name field if present
if [ -f "frontend/package.json" ]; then
  echo "Updating frontend/package.json name -> $NEW_NAME"
  if command -v jq >/dev/null 2>&1; then
    tmp=$(mktemp)
    jq ".name = \"$NEW_NAME\"" frontend/package.json > "$tmp" && mv "$tmp" frontend/package.json
  else
    # best-effort sed replacement of "name": "..."
    sed -E -i '' "s/\"name\"[[:space:]]*:[[:space:]]*\"[^"]+\"/\"name\": \"$NEW_NAME\"/" frontend/package.json || true
  fi
fi

# Update README title if it contains the old repo name "card-nfc"
if [ -f README.md ]; then
  echo "Updating README.md occurrences of 'card-nfc' -> $NEW_NAME (best-effort)"
  sed -E -i '' "s/card-nfc/$NEW_NAME/g" README.md || true
fi

cat <<EOF
Duplication complete.

Next manual steps you should do in the new copy ($DEST_DIR):
- Review and update LICENSE / authors / copyright lines.
- Update any CI configuration (.github/workflows, etc.) to point to the new repo name.
- Rotate secrets and environment variables (do NOT copy .env files with secrets).
- Review package names, Python package/module names, and any hard-coded domain or project slugs.
- Update remote and push: git push -u origin main (or master) after creating the remote repo.

If you want, I can run the script for you here or tailor it to perform additional find/replace targets (backend package names, Python imports, domain strings, etc.).
EOF

exit 0
