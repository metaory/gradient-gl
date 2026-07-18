export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale * 0.6;
  vec2 uv = fragCoord.xy / iResolution.xy;

  vec3 c1 = vec3(0.88, 0.28, 0.42);
  vec3 c2 = vec3(0.72, 0.38, 0.68);

  float n1 = noise(uv * 3.0 + t * 0.5);
  float n2 = noise(uv * 2.2 - t * 0.4 + 4.0);

  vec2 p1 = vec2(0.3 + sin(t * 0.5) * 0.18, 0.7 + cos(t * 0.4) * 0.12);
  vec2 p2 = vec2(0.7 + cos(t * 0.55) * 0.18, 0.3 + sin(t * 0.45) * 0.12);

  float d1 = 1.0 / max(length(uv - p1), 0.01);
  float d2 = 1.0 / max(length(uv - p2), 0.01);
  float blend = d1 / (d1 + d2) + n1 * 0.15 + n2 * 0.1;

  vec3 col = mix(c1, c2, S(0.3, 0.7, blend));
  col += dotNoise(fragCoord, 0.025);

  return vec4(finalColor(col), 1.0);
}
`
