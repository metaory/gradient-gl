<div align="center">
    <img src=".github/assets/logo.png" alt="demo" height="128" />
    <h3>WebGL-powered animated gradients</h3>
    <h3>with seed-driven variation</h3>
    <p>
        <a href="https://metaory.github.io/gradient-gl/">
            metaory.github.io/gradient-gl
        </a>
    </p>
</div>

---

A zero-dependency WebGL library for creating animated gradient backgrounds. gradient-gl accepts a short seed string that pseudo-randomly affects the visual output, enabling easy customization without complex configuration.

---

## Usage

```sh
npm install gradient-gl
# or
pnpm add gradient-gl
```

```typescript
import gradientGL from 'gradient-gl';

await gradientGL(seed?: string, selector?: string);

// random seed, mounted on body
await gradientGL();

// custom seed, mounted on body
await gradientGL('a2.eba9');

// custom seed, mounted on #app
await gradientGL('a2.eba9', '#app');
```


> [!TIP]
> The optional selector is element selector that the canvas will be appended to


---

## Seed

The seed string is a combination of a shader name and a set of values.

Use the [playground](https://metaory.github.io/gradient-gl/) to explore and generate a seed

---

### Syntax

`{shader}.{options}`

The values are a set of numbers that are used to seed the shader.


---

### Shader `[a-z]{1}[0-9]{1}`

The shader name is a short string that identifies the shader.

### Options `[0-9a-f]{1}`

Each tweak option is a hex digit, which is a number between 0 and 15.

`{shader}.{speed}{hue}{saturation}{lightness}`


---

## Benchmark

TODO: create benchmark to compare the performance beween different animation techniques

This is a list of techniques to create an animated gradient background,

They are in order of performance, from slowest to fastest.

1. `SVG filters`
2. `Canvas 2D`
3. `CSS`
4. `WebGL`
5. `WebGPU`


<!-- ```html
🚧 UNDER CONSTRUCTION
<script src="https://cdn.com/gradient-gl?seed=w2.678"></script>
<script src="https://cdn.com/gradient-gl?seed=w2.678&selector=#app"></script>
``` -->

---

## License
[MIT](LICENSE)