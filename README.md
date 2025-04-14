<div align="center">
    <img src="docs/public/logo.png" alt="demo" height="128" />
    <h4>Deterministic WebGL Gradient Animations</h4>
    <h5>
        <a href="https://metaory.github.io/gradient-gl/" target="_blank">Playground</a>
    </h5>
    <p>
        Tiny WebGL library for
        <br>
        Procedural Gradient Animations
        <br>
        Deterministic - Seed-driven
    </p>
</div>

---

<div align="center">
    <h5>Usage Examples</h5>
    <h6>
        <a href="https://metaory.github.io/gradient-gl/vite-vanilla/" target="_blank">Vanilla</a> •
        <a href="https://metaory.github.io/gradient-gl/vite-react/" target="_blank">React</a> •
        <a href="https://metaory.github.io/gradient-gl/vite-vue/" target="_blank">Vue</a>
        <br>
        <small>check <a href="https://github.com/metaory/gradient-gl/tree/master/examples" target="_blank">./examples</a></small>
    </h6>
</div>

---

## Usage

```sh
npm install gradient-gl
```

```js
import gradientGL from 'gradient-gl'

// Required seed argument
await gradientGL('a2.eba9')

// Optional canvas target (default: 'body')
//  uses existing canvas if found,
//   otherwise creates new one in target
await gradientGL('a2.eba9', '#app')
```

### Vite Configuration

```js
export default {
  build: {
    target: 'esnext',
  },
}
```

### CDN

```html
<script src="https://unpkg.com/gradient-gl"></script>
<script type="module">
  await gradientGL('a2.eba9')
</script>
```


```html
 <!-- 🚧 not implemented -->
 <script src=xxx@latest/seed/a2.eba9"></script>
```

## Seed Format

`{shader}.{speed}{hue}{sat}{light}`

- Shader: `[a-z][0-9]` (e.g., `a2`)
- Options: `[0-9a-f]` (hex values)

Explore and generate seeds in the <b><a href="https://metaory.github.io/gradient-gl/" target="_blank">playground</a></b>

## Performance

Animated Gradient Background Techniques

(Slowest → Fastest)

1. `SVG` – CPU-only, DOM-heavy, poor scaling, high memory usage
2. `Canvas 2D` – CPU-only, main-thread load, imperative updates
3. `CSS` – GPU-composited, limited complexity, best for static
4. `WebGL` – GPU-accelerated, shader-driven, optimal balance
5. `WebGPU` – GPU-native, most powerful, limited browser support

> [!NOTE]
> While WebGPU is technically the fastest, WebGL remains the best choice for animated gradients due to its maturity, broad support, and optimal performance/complexity ratio.

> TODO: Interactive benchmark app

---

## License

[MIT](LICENSE)
