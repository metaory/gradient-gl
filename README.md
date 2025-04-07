<div align="center">
    <img src="public/logo.png" alt="demo" height="128" />
    <h4>Deterministic WebGL Gradient Animations</h4>
    <p>
        <a href="https://metaory.github.io/gradient-gl/">
            Live Demo →
        </a>
    </p>
    Tiny WebGL library for procedural gradient animations.
    <br>
    Deterministic. Seed-driven.
</div>

## Usage

```sh
npm install gradient-gl
```

```js
import gradientGL from 'gradient-gl'

// Random seed on body
await gradientGL('a2.eba9')

// Custom seed on #app
await gradientGL('a2.eba9', '#app')
// selector: where to mount the canvas
```

## Seed Format

`{shader}.{speed}{hue}{saturation}{lightness}`

- Shader: `[a-z][0-9]` (e.g., `a2`)
- Options: `[0-9a-f]` (hex values)

Explore and generate seeds in the **[playground](https://metaory.github.io/gradient-gl/)**.

## Performance

Animated Gradient Background Techniques (Slowest → Fastest):

1. `SVG` – CPU-bound, DOM-heavy, poor scaling
2. `Canvas 2D` – Main-thread load, imperative updates
3. `CSS Gradients` – GPU-composited, limited complexity
4. `WebGL` – GPU-accelerated, shader-driven, optimal balance
5. `WebGPU` – Most powerful, but overkill for typical use

> [!NOTE]
> While WebGPU is technically the fastest, WebGL remains the best choice for animated gradients due to its maturity, broad support, and optimal performance/complexity ratio.

> TODO: Interactive benchmark app

---

## License

[MIT](LICENSE)
