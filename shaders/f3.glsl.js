export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  float aspectRatio = iResolution.x / iResolution.y;
  float t = iTime * timeScale;

  // Create abstract fluid movement with aspect ratio correction
  vec2 p = uv * 1.0;
  p.x *= aspectRatio;
  p = p * rot(t * 0.02);

  // Generate multiple noise layers with lower frequency
  float noise1 = noise(p + t * 0.05);
  float noise2 = noise(p * 0.5 - t * 0.08);
  float noise3 = noise(p * 0.25 + t * 0.1);

  // Create color channels with different noise combinations
  vec3 color = vec3(
    noise1 * noise2,
    noise2 * noise3,
    noise3 * noise1
  );

  // Add some movement-based variation
  vec2 movement = vec2(sin(t * 0.1), cos(t * 0.15)) * 0.2;
  movement.x *= aspectRatio;
  float movementNoise = noise(uv + movement);
  color = mix(color, color.zxy, movementNoise);

  // Apply color adjustments
  color = applyHueShift(color, hueShift);
  color = applySaturation(color, saturation);
  color = applyLightness(color, lightness);

  return vec4(color, 1.0);
}
`
