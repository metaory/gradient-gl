#### Deterministic WebGL Gradient Animations

##### [Playground](https://metaory.github.io/gradient-gl/)

Tiny WebGL library for
Procedural Gradient Animations
Deterministic - Seed-driven

---

###### Usage Examples
[CDN](https://metaory.github.io/gradient-gl/cdn-vanilla/) • [Vanilla](https://metaory.github.io/gradient-gl/vite-vanilla/) • [React](https://metaory.github.io/gradient-gl/vite-react/) • [Vue](https://metaory.github.io/gradient-gl/vite-vue/)
source in [./examples](https://github.com/metaory/gradient-gl/tree/master/examples)

---

[🖼️ Showcase Gallery 🌀](https://github.com/metaory/gradient-gl/discussions/5)

 Share your seeds & creations!

---



#### Easiest Usage:

One-Liner Script Tag

> `SeedScript`

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

// Access shader program if needed
const program = await gradientGL('c1.eba9')
```



### Mounting Behavior

- **No selector**: creates and styles a `<canvas>` in `<body>`
- **Selector to an element**: creates and styles a `<canvas>` inside it
- **Selector to a** `<canvas>`: uses it directly, no styles or DOM changes

> Styles are overridable.



### Stacking and Blend

The canvas defaults to `z-index: -1` and no `mix-blend-mode`. That fits most full-page backgrounds, but your layout may need different values.

Opaque page backgrounds can hide a `-1` canvas. Fixed headers, stacking contexts, or overlays may want another `z-index`. Color grading against UI often wants `mix-blend-mode`.

```css
canvas#gradient-gl {
  z-index: 0 !important;
  mix-blend-mode: color !important;
}
```

Use `!important` when overriding the library defaults.

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
    <!-- Latest with default mounting point -->
<script type="module" src="https://unpkg.com/gradient-gl?seed=c1.eba9"></script>

    <!-- optionally pin to a version @x.x.x -->
<script type="module" src="https://unpkg.com/gradient-gl@1.4.1?seed=c1.eba9"></script>

    <!-- optionally set the mount selector -->
        <!-- mount inside the <main> tag -->
<script type="module" src="https://unpkg.com/gradient-gl?seed=c1.eba9&selector=main"></script>
        <!-- mount inside the .wrapper>content -->
        <!-- note: any valid css selector can be used -->
<script type="module" src="https://unpkg.com/gradient-gl?seed=c1.eba9&selector=.wrapper>.content"></script>
        <!-- mount inside the #app -->
        <!-- note hash needs to be escaped as %23 -->
        <!-- #app → %23app  -->
<script type="module" src="https://unpkg.com/gradient-gl?seed=c1.eba9&selector=%23app"></script>
```



## Seed Format

`{shader}.{speed}{hue}{sat}{light}`

- Shader: `[a-z][0-9]` (e.g., `c1`, `n3`)
- Options: `[0-9a-f]` (hex values)

Explore and generate seeds in the **[playground](https://metaory.github.io/gradient-gl/)**

## Shaders

IDs are alphabetical. Import the live list with `import { shaderIds } from 'gradient-gl'`.


| Series | IDs                 | Character                |
| ------ | ------------------- | ------------------------ |
| **b**  | `b1` `b2` `b3` `b4` | classic layered / radial |
| **c**  | `c1` `c4`           | contrast duotone flow    |
| **f**  | `f1` `f3`           | fluid RGB noise          |
| **l**  | `l1` `l3` `l5`      | liquid warp              |
| **n**  | `n1` `n2` `n3` `n4` | noisy color islands      |
| **s**  | `s1` `s3`           | soft shade blobs         |


`n1`/`n2` are softer blends; `n3`/`n4` are sharper islands.

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
