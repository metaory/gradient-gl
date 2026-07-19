# React Example

<div align="center">
    <h3>
        <a href="https://metaory.github.io/gradient-gl/vite-react/" target="_blank">
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

```jsx
import { useEffect } from 'react'
import gradientGL from 'gradient-gl'

function App() {
  useEffect(() => {
    gradientGL('c4.ec55')
  }, [])

  return <div id="app" />
}
```

Seed format: `{shader}.{speed}{hue}{sat}{light}`. Available shaders: `b1`–`b4`, `c1` `c4`, `f1` `f3`, `l1` `l3` `l5`, `n1`–`n4`, `s1` `s3`. See the [main README](../../README.md#shaders).
