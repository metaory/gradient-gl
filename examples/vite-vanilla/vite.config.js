export default {
  base: '/gradient-gl/vite-vanilla/',
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  }
}
