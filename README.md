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

#### SeedScript
One script tag:

```html
<script type="module" src="https://unpkg.com/gradient-gl?seed=c1.eba9"></script>
```

> [read more](#seedscript-usage)

---

## Usage

```sh
npm install gradient-gl
```

```javascript
import gradientGL from 'gradient-gl'

// Mounts to <body>
gradientGL('c1.eba9')

// Mounts inside #app
gradientGL('c1.eba9', '#app')

// Returns the program
const program = await gradientGL('c1.eba9')
```

### Mounting Behavior

- **No selector**: creates and styles a `<canvas>` in `<body>`
- **Selector to an element**: creates and styles a `<canvas>` inside it
- **Selector to a `<canvas>`**: uses it directly, no styles or DOM changes

> Styles are overridable.

### Stacking and Blend

Default canvas style: `z-index: -1`, no `mix-blend-mode`.

An opaque `html`/`body` background covers a `-1` canvas. Raise `z-index` for fixed chrome or stacking contexts that sit above it. Set `mix-blend-mode` when the gradient should grade against page content.

```css
#gradient-gl {
  z-index: 0 !important;
  mix-blend-mode: color !important;
}
```

Library defaults use `!important`. Match that in overrides.

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
    gradientGL('c1.eba9')
</script>
```

#### ESM

```html
<script type="module">
    import gradientGL from 'https://esm.sh/gradient-gl'
    gradientGL('c1.eba9')
</script>
```

### SeedScript Usage

```html
<!-- latest, mounts on body -->
<script type="module" src="https://unpkg.com/gradient-gl?seed=c1.eba9"></script>

<!-- pin a version -->
<script type="module" src="https://unpkg.com/gradient-gl@1.4.1?seed=c1.eba9"></script>

<!-- mount inside <main> -->
<script type="module" src="https://unpkg.com/gradient-gl?seed=c1.eba9&selector=main"></script>

<!-- any CSS selector works -->
<script type="module" src="https://unpkg.com/gradient-gl?seed=c1.eba9&selector=.wrapper>.content"></script>

<!-- # must be escaped: #app → %23app -->
<script type="module" src="https://unpkg.com/gradient-gl?seed=c1.eba9&selector=%23app"></script>
```

## Seed Format

`{shader}.{speed}{hue}{sat}{light}`

- Shader: `[a-z][0-9]` (e.g., `c1`, `n3`)
- Options: `[0-9a-f]` (hex values)

Explore and generate seeds in the <b><a href="https://metaory.github.io/gradient-gl/" target="_blank">playground</a></b>

## Shaders

IDs are alphabetical. Import the live list with `import { shaderIds } from 'gradient-gl'`.

| Series | IDs | Character |
|--------|-----|-----------|
| **b** | `b1` `b2` `b3` `b4` | classic layered / radial |
| **c** | `c1` `c4` | contrast duotone flow |
| **f** | `f1` `f3` | fluid RGB noise |
| **l** | `l1` `l3` `l5` | liquid warp |
| **n** | `n1` `n2` `n3` `n4` | noisy color islands |
| **s** | `s1` `s3` | soft shade blobs |

`n1`/`n2` are softer blends; `n3`/`n4` are sharper islands.

## Performance

Animated gradient background techniques, slowest to fastest:

1. `SVG`: CPU-only, DOM-heavy, poor scaling, high memory
2. `Canvas 2D`: CPU-only, main-thread load, imperative updates
3. `CSS`: GPU-composited, limited complexity, best for static work
4. `WebGL`: GPU shaders, wide support
5. `WebGPU`: faster where available, thinner browser support

> [!NOTE]
> WebGPU is faster where it runs. WebGL covers more browsers and is enough for animated gradients.

> TODO: Interactive benchmark app

---

## License

[MIT](LICENSE)
