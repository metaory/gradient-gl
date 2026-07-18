export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale;
  vec2 p = getUV(fragCoord);

  vec2 p1 = p * 0.5;
  vec2 p2 = p * 0.75;

  float noise1 = noise(p1 + t * 0.05);
  float noise2 = noise(p2 - t * 0.08);
  float noise3 = noise(p1 * 0.25 + t * 0.1);

  float combinedNoise = (noise1 * 0.4 + noise2 * 0.3 + noise3 * 0.3);

  vec3 color = vec3(
    noise1 * 0.6 + 0.4,
    noise2 * 0.6 + 0.4,
    combinedNoise * 0.6 + 0.4
  );

  vec2 movement = vec2(sin(t * 0.1), cos(t * 0.15)) * 0.2;
  float movementNoise = noise(p + movement);
  color = mix(color, color.zxy, movementNoise * 0.3);

  return vec4(finalColor(color), 1.0);
}
`
