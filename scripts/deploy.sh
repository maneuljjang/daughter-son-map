#!/usr/bin/env bash
# GitHub Pages 배포: 빌드한 dist/ 를 gh-pages 브랜치로 올립니다.
#   npm run deploy
# - 카카오·TMAP 키는 로컬 .env 에서 읽습니다 (저장소 소스에는 올라가지 않음).
set -euo pipefail
cd "$(dirname "$0")/.."
REPO_URL=$(git remote get-url origin)
NAME=$(basename -s .git "$REPO_URL")
OWNER=$(echo "$REPO_URL" | sed -E 's#.*github.com[:/]([^/]+)/.*#\1#')
SITE="https://$OWNER.github.io/$NAME"

MSYS_NO_PATHCONV=1 VITE_BASE="/$NAME/" VITE_SITE_URL="$SITE" npx vite build
touch dist/.nojekyll

cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C .. config user.name)" -c user.email="$(git -C .. config user.email)" \
  commit -q -m "deploy $(date '+%Y-%m-%d %H:%M')"
git push -q -f "$REPO_URL" gh-pages
rm -rf .git
echo "배포 완료 → $SITE/"
