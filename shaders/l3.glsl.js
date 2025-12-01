export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  float t = iTime * timeScale;

  float n1 = noise(uv * 2.0 + t * 0.1);
  float n2 = noise(uv * 1.5 - t * 0.08 + 3.0);

  uv += vec2(n1 - 0.5, n2 - 0.5) * 0.1;

  float d = -(t * 0.25);
  float a = 0.0;

  for (float i = 0.0; i < 6.0; ++i) {
    float ni = noise(uv * (i + 1.0) + t * 0.05 * i);
    a += cos(d + i * uv.x * 0.7 - a * 0.8 + ni * 0.3);
    d += 0.4 * sin(a + i * uv.y * 0.7 + ni * 0.3);
  }

  d += (t * 0.25);

  float r = cos(uv.x * a * 0.6) * 0.5 + 0.5;
  float g = cos(uv.y * d * 0.6) * 0.4 + 0.5;
  float b = cos((a + d) * 0.5) * 0.35 + 0.55;

  vec3 col = vec3(r, g, b);
  col = mix(col, col.yzx, n1 * 0.25);
  col = mix(col, col.zxy, n2 * 0.2);

  col = pow(col, vec3(0.95));

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`
