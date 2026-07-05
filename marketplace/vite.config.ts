import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      // Dev-only: forwards the CRM (frontend/, its own Vite dev server on 5173)
      // through this origin so the public site and CRM live at one address,
      // matching how a single reverse proxy would route them in production.
      '/crm': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
