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

```javascript
// Object function call  
import gradientGL from 'https://cdn.com/gradient-gl';  
gradientGL();
gradientGL({ seed: 'w2.678' });
gradientGL({ seed: 'w2.678', selector: '#app' });

// Seed function call  
import gradientGL from 'https://cdn.com/gradient-gl';  
gradientGL('w2.678');
gradientGL('w2.678', '#app');

// ES Module usage
import 'https://cdn.com/gradient-gl?seed=w2.678';
import 'https://cdn.com/gradient-gl?seed=w2.678&selector=#app';

// Dynamic import
import(`https://cdn.com/gradient-gl?seed=w2.678`);
import(`https://cdn.com/gradient-gl?seed=w2.678&selector=#app`);
```

```html
<!-- HTML usage -->
<script src="https://cdn.com/gradient-gl?seed=w2.678"></script>
<script src="https://cdn.com/gradient-gl?seed=w2.678&selector=#app"></script>
```

---

<div align="center">
    <h5><kbd>Gradient GL</kbd></h5>
</div>

---

## License
[MIT](LICENSE)