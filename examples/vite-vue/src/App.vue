<script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <a id="gradient-gl-logo" href="https://github.com/metaory/gradient-gl" rel="noreferrer">
    <img src="https://raw.githubusercontent.com/metaory/gradient-gl/refs/heads/master/docs/public/logo.png"
      width="200"
      alt="logo" />
  </a>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Hello gradient-gl" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
