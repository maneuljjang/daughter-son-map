#!/usr/bin/env bash
# GitHub Pages 배포: 빌드한 dist/ 를 gh-pages 브랜치로 올립니다.
#   npm run deploy
# - 카카오 키는 로컬 .env 의 VITE_KAKAO_JS_KEY 를 사용합니다 (저장소 소스에는 올라가지 않음).
set -euo pipefail
cd "$(dirname "$0")/.."
REPO_URL=$(git remote get-url origin)
NAME=$(basename -s .git "$REPO_URL")

MSYS_NO_PATHCONV=1 VITE_BASE="/$NAME/" npx vite build
touch dist/.nojekyll

cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C .. config user.name)" -c user.email="$(git -C .. config user.email)" \
  commit -q -m "deploy $(date '+%Y-%m-%d %H:%M')"
git push -q -f "$REPO_URL" gh-pages
rm -rf .git
echo "배포 완료 → https://$(git -C .. remote get-url origin | sed -E 's#.*github.com[:/]([^/]+)/.*#\1#').github.io/$NAME/"
