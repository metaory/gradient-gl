<script setup>
import { ref } from 'vue'

defineProps({
  msg: String,
})

const count = ref(0)
</script>

<template>
  <h2>{{ msg }}</h2>
  <h3>from vite-vue</h3>
  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>
  <p class="read-the-docs">Click on the Gradient GL logo to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
