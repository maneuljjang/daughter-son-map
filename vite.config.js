import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const r = (p) => fileURLToPath(new URL(p, import.meta.url))

// GitHub Pages에서는 https://<아이디>.github.io/<저장소>/ 아래에 올라가므로
// 배포할 때 VITE_BASE=/<저장소>/ 를 넣어 줍니다 (scripts/deploy.sh 가 알아서 넣어요).

// 링크를 그냥 붙여 넣었을 때 보이는 미리보기(오픈그래프). 배포할 때 VITE_SITE_URL 을 넣어 줍니다.
// 카카오톡은 링크 미리보기 이미지를 오래 저장해 둬요. 카드 이미지를 바꾸면 이 숫자를 올려 주세요
// (src/lib/kakaoShare.js 의 SHARE_IMAGE_VERSION 과 같게).
const SHARE_IMAGE_VERSION = 2

const ogTags = () => ({
  name: 'og-tags',
  transformIndexHtml(html, ctx) {
    const site = (process.env.VITE_SITE_URL || '').replace(/\/$/, '')
    const isInvite = ctx.path.includes('invite')
    const title = isInvite ? '엄마, 아빠 이번에 올라오시면 여기 가요' : '딸, 아들 어디가'
    const desc = isInvite ? '딸, 아들이 보낸 성북동 나들이 초대장' : '성북동, 부모님 모시고 오기 좋은 동네. 걷기 편한 코스를 짜서 초대장으로 보내요.'
    const tags = [
      `<meta property="og:type" content="website" />`,
      `<meta property="og:title" content="${title}" />`,
      `<meta property="og:description" content="${desc}" />`,
      site && `<meta property="og:image" content="${site}/share/invite-card.png?v=${SHARE_IMAGE_VERSION}" />`,
      site && `<meta property="og:url" content="${site}/${isInvite ? 'invite/' : ''}" />`,
    ].filter(Boolean)
    return html.replace('</head>', tags.map((t) => `    ${t}`).join('\n') + '\n  </head>')
  },
})

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), ogTags()],
  build: {
    rollupOptions: {
      input: {
        main: r('./index.html'), // 자녀 화면  /
        invite: r('./invite/index.html'), // 부모님 화면  /invite/?r=...
      },
    },
  },
  server: { port: 5173, strictPort: true },
  test: { environment: 'node' },
})
