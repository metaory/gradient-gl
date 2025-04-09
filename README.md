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

// Required seed argument
await gradientGL('a2.eba9')

// Optional parent selector as second argument
await gradientGL('a2.eba9', '#app')
```

The library creates a fullscreen canvas with these CSS properties:
```css
position: fixed;
inset: 0;
width: 100%;
height: 100%;
z-index: -1;
```

If a selector is provided:
- Creates the canvas as a child of the selected element
- If the selector points to an existing canvas, uses it instead of creating a new one

## Seed Format

`{shader}.{speed}{hue}{saturation}{lightness}`

- Shader: `[a-z][0-9]` (e.g., `a2`)
- Options: `[0-9a-f]` (hex values)

Explore and generate seeds in the **[playground](https://metaory.github.io/gradient-gl/)**.

## URL Sharing

Click copy to share, randomize to clear.

## Performance

Animated Gradient Background Techniques (Slowest → Fastest):

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
