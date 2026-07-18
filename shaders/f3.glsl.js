export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale;
  vec2 p = getUV(fragCoord);
  p = p * rot(t * 0.02);

  float noise1 = noise(p + t * 0.05);
  float noise2 = noise(p * 0.5 - t * 0.08);
  float noise3 = noise(p * 0.25 + t * 0.1);

  vec3 color = vec3(
    noise1 * noise2,
    noise2 * noise3,
    noise3 * noise1
  );

  vec2 movement = vec2(sin(t * 0.1), cos(t * 0.15)) * 0.2;
  float movementNoise = noise(p + movement);
  color = mix(color, color.zxy, movementNoise);

  return vec4(finalColor(color), 1.0);
}
`
