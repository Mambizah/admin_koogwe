import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'https://koogwe22backend-production.up.railway.app',
        changeOrigin: true,
        secure: true,
        // On garde /api car le backend NestJS utilise déjà le préfixe /api
      },
    },
  },
})