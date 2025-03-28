<div align="center">
    <img src=".github/assets/logo.svg" alt="demo" height="60" />
    <h3>Blurry, Noisy, Pseudo-Random</h3>
    <h3>WebGL Gradients with Seed-Based Control</h3>
</div>

> [!CAUTION]
> 🚧 UNDER CONSTRUCTION

---

**gradient-gl** is a **GPU-accelerated WebGL library** for generating **blurry, meshy, smooth gradients** with **structured randomness and controlled variation**. Using a **simple, seed-based API**, it creates **fluid, noise-infused animations** that are both **performant and visually striking**.  

With a **4-character base36 seed**, it balances **uniqueness and reproducibility**. **Zero-dependency**, lightweight, and optimized for **real-time rendering**, it works effortlessly via ESM imports.

---

```js
// 1. Default usage (Mounts to <body> with a random seed)
gradientGL();

// 2. Mount to a specific element with a random seed
gradientGL('#app');

// 3. Mount with a custom seed (4-char base36: first char = variation type, rest = shader params)
gradientGL('#app', 'e48a');
```

### Seed Format
A 4-character base36 string (e48a):
- First character (e) → Variation type (0-9, a-z)
- Next 3 characters (48a) → Shader parameters (0-9, a-z)

Each character can be:
- Numbers: 0-9
- Letters: a-z

<div align="center">
    <h5><kbd>Gradient GL</kbd></h5>
</div>

---

## License
[MIT](LICENSE)