import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const r = (p) => fileURLToPath(new URL(p, import.meta.url))

// Vercel 은 도메인 루트(/)에 올라가므로 기본값 '/' 그대로 씁니다.
// 하위 경로에 올릴 때만 VITE_BASE=/<경로>/ 를 넣어 주세요.
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
