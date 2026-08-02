import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Hermes-project-webapp/',
  plugins: [react()],
  server: {
    fs: {
      deny: ['safe-sources', 'safe-sources/**'],
    },
  },
})
