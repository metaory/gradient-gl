import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/gradient-gl/vite-vue/',
  build: {
    target: 'esnext',
  },
  plugins: [vue()],
})
