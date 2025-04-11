export default {
  base: '/gradient-gl/vite-vanilla/',
  build: {
    target: 'esnext',
    rollupOptions: {
      external: ['gradient-gl']
    }
  }
}
