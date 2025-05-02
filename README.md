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

// Mounts to <body>
gradientGL('a2.eba9')

// Mounts inside #app
gradientGL('a2.eba9', '#app')

// Access shader program if needed
const program = await gradientGL('a2.eba9')
```

### Mounting Behavior

- **No selector**: creates and styles a `<canvas>` in `<body>`
- **Selector to an element**: creates and styles a `<canvas>` inside it
- **Selector to a `<canvas>`**: uses it directly, no styles or DOM changes

> Styles are overridable.

### Vite Configuration

```js
export default {
  build: {
    target: 'esnext',
  },
}
```

### CDN

#### UNPKG

```html
<script type="module">
    import gradientGL from 'https://unpkg.com/gradient-gl'
    gradientGL('a2.eba9')
</script>
```

#### ESM

```html
<script type="module">
    import gradientGL from 'https://esm.sh/gradient-gl'
    gradientGL('a2.eba9')
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
