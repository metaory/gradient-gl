export default {
  base: '/gradient-gl/vite-vanilla/',
  build: {
    target: 'esnext',
    assetsInclude: ['**/*.glsl']
  },
  optimizeDeps: {
    exclude: ['gradient-gl']
  }
}
