function createUniformArray(seed, maxTweaks = 6) {
    const toByte = (value, max = 255) => Math.min(Math.max(Math.round(value), 0), max);

    // Extract universal values (use defaults if missing)
    const speed = toByte(Number.parseInt(seed[0] || '8', 16) / 15 * 255);
    const saturation = toByte(Number.parseInt(seed[1] || 'C', 16) / 15 * 255);
    const lightness = toByte(Number.parseInt(seed[2] || 'A', 16) / 15 * 255);

    // Extract tweaks (pairs of hex values → 0-255)
    const tweaks = [];
    for (let i = 3; i < seed.length; i += 2) {
      const tweakValue = Number.parseInt(seed.slice(i, i + 2) || '00', 16);
      tweaks.push(toByte(tweakValue));
    }

    // Pad with zeros to ensure maxTweaks size
    while (tweaks.length < maxTweaks) tweaks.push(0);

    return new Uint8Array([speed, saturation, lightness, ...tweaks]);
  }

export default (seed) => {
    const [shader, hex] = seed.split('.')
    return [shader, createUniformArray(hex)]
}

// [ speed, hue, saturation, lightness, tweak1, tweak2, tweak3, ... ]