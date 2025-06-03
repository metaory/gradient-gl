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
    <h6>
        Usage Examples
        <br>
        <a href="https://metaory.github.io/gradient-gl/cdn-vanilla/" target="_blank">CDN</a> •
        <a href="https://metaory.github.io/gradient-gl/vite-vanilla/" target="_blank">Vanilla</a> •
        <a href="https://metaory.github.io/gradient-gl/vite-react/" target="_blank">React</a> •
        <a href="https://metaory.github.io/gradient-gl/vite-vue/" target="_blank">Vue</a>
        <br>
        <small>source in <a href="https://github.com/metaory/gradient-gl/tree/master/examples" target="_blank">./examples</a></small>
    </h6>
    <hr>
    <p>
        <a href="https://github.com/metaory/gradient-gl/discussions/5" target="_blank">
            🖼️ Showcase Gallery 🌀
        </a>
    </p>
    Share your seeds & creations!
</div>

---

## Easiest Usage: One-Liner Script Tag

> `SeedScript`

```html
<script type="module" src="https://esm.sh/gradient-gl?seed=a2.eba9"></script>
```

---

## Usage

```sh
npm install gradient-gl
```

```javascript
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
    <!-- Latest with default mounting point -->
<script type="module" src="https://esm.sh/gradient-gl?seed=a2.eba9"></script>
<script type="module" src="https://unpkg.com/gradient-gl?seed=a2.eba9"></script>

    <!-- optionally pin to a version @x.x.x -->
<script type="module" src="https://esm.sh/gradient-gl@1.4.0?seed=a2.eba9"></script>
<script type="module" src="https://unpkg.com/gradient-gl@1.4.0?seed=a2.eba9"></script>

    <!-- optionally set the mount selector -->
        <!-- mount inside the <main> tag -->
<script type="module" src="https://esm.sh/gradient-gl?seed=a2.eba9&selector=main"></script>
        <!-- mount inside the .wrapper>content -->
        <!-- note: any valid css selector can be used -->
<script type="module" src="https://esm.sh/gradient-gl?seed=a2.eba9&selector=.wrapper>content"></script>
        <!-- mount inside the #app -->
        <!-- note hash needs to be escaped as %23 -->
        <!-- #app → %23app  -->
<script type="module" src="https://esm.sh/gradient-gl?seed=a2.eba9&selector=%23app"></script>
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
