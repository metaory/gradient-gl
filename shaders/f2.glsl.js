export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  float aspectRatio = iResolution.x / iResolution.y;
  float t = iTime * timeScale;

  // Create multiple layers of fluid movement with aspect ratio correction
  vec2 p1 = uv * 1.0;
  p1.x *= aspectRatio;
  vec2 p2 = uv * 1.5;
  p2.x *= aspectRatio;

  // Generate noise at different scales with lower frequency
  float noise1 = noise(p1 + t * 0.05);
  float noise2 = noise(p2 - t * 0.08);
  float noise3 = noise(p1 * 0.5 + t * 0.1);

  // Combine noise layers
  float combinedNoise = (noise1 + noise2 + noise3) / 3.0;

  // Create color based on noise
  vec3 color = vec3(
    noise1 * 0.7 + 0.3,
    noise2 * 0.7 + 0.3,
    combinedNoise * 0.7 + 0.3
  );

  // Add some rotation-based variation
  vec2 rotatedUV = uv * rot(t * 0.05);
  rotatedUV.x *= aspectRatio;
  float rotationNoise = noise(rotatedUV * 0.5);
  color = mix(color, color.yzx, rotationNoise * 0.3);

  // Apply color adjustments
  color = applyHueShift(color, hueShift);
  color = applySaturation(color, saturation);
  color = applyLightness(color, lightness);

  return vec4(color, 1.0);
}
`
