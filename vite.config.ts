import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 프로젝트 사이트 배포 시 base를 레포명으로 변경하세요
// 예: base: '/secret-letter/'
export default defineConfig({
  plugins: [react()],
  base: './',
})
