#!/usr/bin/env bash
# 미리보기 배포: 지금 브랜치를 빌드해서 https://<아이디>.github.io/<저장소>/preview/ 에 올립니다.
#   npm run deploy:preview
# - 원래 사이트(루트)는 건드리지 않고 gh-pages 브랜치의 preview/ 폴더만 바꿉니다.
# - 주의: 나중에 main 에서 npm run deploy 를 하면 gh-pages 가 통째로 바뀌어 미리보기가 사라져요.
#   그때는 미리보기가 필요하면 이 스크립트를 다시 실행하면 돼요.
set -euo pipefail
cd "$(dirname "$0")/.."
REPO_URL=$(git remote get-url origin)
NAME=$(basename -s .git "$REPO_URL")
OWNER=$(echo "$REPO_URL" | sed -E 's#.*github.com[:/]([^/]+)/.*#\1#')
SITE="https://$OWNER.github.io/$NAME/preview"
BRANCH=$(git branch --show-current)

MSYS_NO_PATHCONV=1 VITE_BASE="/$NAME/preview/" VITE_SITE_URL="$SITE" npx vite build --outDir dist-preview --emptyOutDir

WORK=$(mktemp -d)
ROOT=$(pwd)
trap 'rm -rf "$WORK" "$ROOT/dist-preview"' EXIT
git clone -q --depth 1 --branch gh-pages "$REPO_URL" "$WORK/site"
rm -rf "$WORK/site/preview"
cp -r dist-preview "$WORK/site/preview"
touch "$WORK/site/.nojekyll"

cd "$WORK/site"
git add -A
if git diff --cached --quiet; then
  echo "바뀐 것이 없어요."
else
  git -c user.name="$(git -C "$OLDPWD" config user.name)" -c user.email="$(git -C "$OLDPWD" config user.email)" \
    commit -q -m "preview: $BRANCH $(date '+%Y-%m-%d %H:%M')"
  git push -q origin gh-pages
fi
echo "미리보기 배포 완료 → $SITE/"
