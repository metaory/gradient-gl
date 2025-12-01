export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  float t = iTime * timeScale;

  float d = -(t * 0.3);
  float a = 0.0;

  for (float i = 0.0; i < 9.0; ++i) {
    a += cos(d + i * uv.x - a);
    d += 0.5 * sin(a + i * uv.y);
  }

  d += (t * 0.3);

  float r = cos(uv.x * a) * 0.7 + 0.3;
  float g = cos(uv.y * d) * 0.5 + 0.2;
  float b = cos(a + d) * 0.3 + 0.5;
  vec3 col = vec3(r, g, b);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`

