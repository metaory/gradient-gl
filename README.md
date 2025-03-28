<div align="center">
    <img src=".github/assets/logo.svg" alt="demo" height="60" />
    <h3>Blurry, noisy, pseudo-random</h3>
    <h3>WebGL gradients with seed-based control</h3>
</div>

> [!CAUTION]
> 🚧 UNDER CONSTRUCTION

---

**hash-gradient-gl** is a **GPU-accelerated WebGL library** for generating **blurry, meshy, smooth gradients** with **structured randomness and controlled variation**. Using a **simple, seed-based API**, it creates **fluid, noise-infused animations** that are both **performant and visually striking**.  

With a **4-character hex seed**, it balances **uniqueness and reproducibility**. **Zero-dependency**, lightweight, and optimized for **real-time rendering**, it works effortlessly via JavaScript or a simple `<script>` import.

---

```js
// 1. Default usage (Mounts to <body> with a random seed)
hashgrad();

// 2. Mount to a specific element with a random seed
hashgrad('#app');

// 3. Mount with a custom seed (4-char hex: first letter = variation type, rest = shader params)
hashgrad('#app', 'e48a');

```


```html
<!-- 4. HTML Script Import with Seed -->
<script src="https://cdn.com/grad-gl?seed=ae32"></script>

<!-- 5. HTML Script with Data Attribute -->
<script src="https://cdn.example.com/hash-gradient-gl" data-seed="ae32"></script>

```

### Seed Format
A 4-character hex string (e48a):

- First character (e) → Variation type.
- Next 3 hex values (48a) → Shader parameters.


<div align="center">
    <h5><kbd>Gradient GL</kbd></h5>
</div>

---

## License
[MIT](LICENSE)