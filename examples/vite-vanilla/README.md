# Vanilla Example

<div align="center">
    <h3>
        <a href="https://metaory.github.io/gradient-gl/vite-vanilla/" target="_blank">
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

```js
import gradientGL from 'gradient-gl'

// Initialize with seed
await gradientGL('a2.eba9')
```
