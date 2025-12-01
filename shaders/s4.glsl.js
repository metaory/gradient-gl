export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  float ar = iResolution.x / iResolution.y;
  float t = iTime * timeScale;

  uv.y -= 0.5;
  uv.x = (uv.x - 0.5) * ar;

  vec2 p1 = vec2(sin(t * 0.4) * 0.3, cos(t * 0.35) * 0.25);
  vec2 p2 = vec2(cos(t * 0.5) * 0.25, sin(t * 0.45) * 0.3);
  vec2 p3 = vec2(sin(t * 0.3 + 2.0) * 0.35, cos(t * 0.4 + 1.5) * 0.2);

  float n1 = noise(uv * 1.5 + t * 0.15);
  float n2 = noise(uv * 1.2 - t * 0.12 + 5.0);

  float d1 = length(uv - p1 + (n1 - 0.5) * 0.12);
  float d2 = length(uv - p2 + (n2 - 0.5) * 0.12);
  float d3 = length(uv - p3 + (n1 * n2 - 0.25) * 0.15);

  float w1 = 1.0 / (d1 * d1 + 0.08);
  float w2 = 1.0 / (d2 * d2 + 0.08);
  float w3 = 1.0 / (d3 * d3 + 0.08);
  float wSum = w1 + w2 + w3;

  float blend = (w1 * 0.0 + w2 * 0.5 + w3 * 1.0) / wSum;
  blend += (n1 + n2 - 1.0) * 0.15;

  float cycle = sin(t * 0.3) * 0.5 + 0.5;
  vec3 c0 = mix(vec3(1.0), vec3(0.95, 0.92, 0.88), cycle);
  vec3 c1 = mix(vec3(0.36, 0.79, 0.94), vec3(0.4, 0.65, 0.95), cycle);
  vec3 c2 = mix(vec3(0.97, 0.67, 0.96), vec3(0.85, 0.5, 0.75), cycle);
  vec3 c3 = mix(vec3(0.97, 0.84, 0.44), vec3(0.95, 0.6, 0.35), cycle);

  vec3 col = mix(c0, c1, smoothstep(0.0, 0.4, blend));
  col = mix(col, c2, smoothstep(0.3, 0.7, blend));
  col = mix(col, c3, smoothstep(0.6, 1.0, blend));

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`
