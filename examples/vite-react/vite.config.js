import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/gradient-gl/vite-react/',
  build: {
    target: 'esnext',
  },
  plugins: [react()],
})

