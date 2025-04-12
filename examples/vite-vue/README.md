# Vue Example

<div align="center">
    <h3>
        <a href="https://metaory.github.io/gradient-gl/vite-vue/" target="_blank">
            Live Preview →
        </a>
    </h3>
</div>

## Setup

```bash
npm install
npm run dev
```

## Vite Configuration

```js
export default {
  build: {
    target: 'esnext',
  },
}
```

## Usage

```html
<script setup>
import { onMounted } from 'vue'
import gradientGL from 'gradient-gl'

onMounted(() => {
  gradientGL('a2.eba9')
})
</script>

<template>
  <div id="app" />
</template>
```

# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
