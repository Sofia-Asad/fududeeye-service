import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Served under /crm/ behind the marketplace's dev proxy (and in production behind
  // one reverse proxy) so both frontends live at a single origin.
  base: '/crm/',
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
