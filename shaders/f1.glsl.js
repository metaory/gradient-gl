export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  float aspectRatio = iResolution.x / iResolution.y;
  float t = iTime * timeScale;

  // Create fluid-like movement with aspect ratio correction
  vec2 p = uv * 2.0 - 1.0;
  p.x *= aspectRatio;
  p *= 0.5; // Reduced scale for larger blobs

  // Add some noise-based distortion with lower frequency
  float noise1 = noise(p + t * 0.05); // Reduced time factor
  float noise2 = noise(p * 0.5 - t * 0.1); // Reduced scale and time factor

  // Create gradient with noise influence
  vec3 color = vec3(
    noise1 * 0.5 + 0.5,
    noise2 * 0.5 + 0.5,
    (noise1 + noise2) * 0.5
  );

  // Apply color adjustments
  color = applyHueShift(color, hueShift);
  color = applySaturation(color, saturation);
  color = applyLightness(color, lightness);

  return vec4(color, 1.0);
}
`
