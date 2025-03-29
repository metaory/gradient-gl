<div align="center">
    <img src="public/logo.svg" alt="demo" height="60" />
    <h3>Blurry, Noisy, Pseudo-Random</h3>
    <h3>WebGL Gradients with Seed-Based Control</h3>
    <p>
        <a href="https://metaory.github.io/gradient-gl/">
            <img src="https://img.shields.io/badge/Live%20Demo-View%20Now-blue?style=flat-square" alt="Live Demo">
        </a>
    </p>
</div>

> [!CAUTION]
> 🚧 UNDER CONSTRUCTION

---

**gradient-gl** is a **GPU-accelerated WebGL library** for generating **blurry, meshy, smooth gradients** with **structured randomness and controlled variation**. Using a **simple, seed-based API**, it creates **fluid, noise-infused animations** that are both **performant and visually striking**.  

With a **5-character seed**, it balances **uniqueness and reproducibility**. **Zero-dependency**, lightweight, and optimized for **real-time rendering**, it works effortlessly via ESM imports.

---

```js
// 1. Default usage (Mounts to <body> with a random seed)
gradientGL();

// 2. Mount to a specific element with a random seed
gradientGL('#app');

// 3. Mount with a custom seed (5-char: type + variation + hex params)
gradientGL('#app', 'w1abc'); // warp type, variation 1, params abc
```

### Seed Format
A 5-character string (e.g., 'w1abc'):
- First character → Shader type:
  - 'w': warp
  - 's': soft
  - 'f': fuse
  - 'n': neon
  - 'l': flow
- Second character → Variation number (1-5)
- Last 3 characters → Shader parameters (hex: 0-f)

<div align="center">
    <h5><kbd>Gradient GL</kbd></h5>
</div>

---

## License
[MIT](LICENSE)