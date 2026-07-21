import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Alles onder /api gaat in dev naar de .NET backend.
      // Zo praat de browser met één origin en is CORS niet nodig.
      '/api': {
        target: 'http://localhost:5269',
        changeOrigin: true,
      },
    },
  },
})
