import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const r = (p) => fileURLToPath(new URL(p, import.meta.url))

// GitHub Pages에서는 https://<아이디>.github.io/<저장소>/ 아래에 올라가므로
// 배포할 때 VITE_BASE=/<저장소>/ 를 넣어 줍니다 (.github/workflows/deploy.yml 참고).
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
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
