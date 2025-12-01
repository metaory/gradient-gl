export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  float mr = min(iResolution.x, iResolution.y);
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / mr;
  float t = iTime * timeScale;

  float n1 = noise(uv * 1.5 + t * 0.15);
  float n2 = noise(uv * 2.0 - t * 0.12 + 3.0);
  float n3 = noise(uv * 1.2 + t * 0.1 + 7.0);

  uv += vec2(n1 - 0.5, n2 - 0.5) * 0.25;
  uv.x *= 0.6;
  uv.x = sin(uv.x * 1.2 + 0.5) * 0.8;

  float d = -t * 0.3;

  float a = sin(uv.x * cos(uv.y + d + n1 * 0.5));
  float b = cos(uv.x * cos(uv.y * a - d + n2 * 0.5));

  for (float i = 1.0; i <= 3.0; i++) {
    float k = (3.0 - i) / 3.0;
    float ni = noise(uv * i + t * 0.1 * i);
    a += sin(uv.y - k + i / cos(b / 3.0 / 2.0) + ni * 0.3);
    b += cos(uv.x + 0.5 + a * i + sin(d / 3.0) + ni * 0.3);
  }

  a = cos(b + n3 * 0.4);
  b = sin(b + n1 * 0.4);
  float s = (uv.x * a + uv.y * a + uv.x * b + uv.y * b) * 0.6 + 0.2;

  vec3 col = vec3(a, b, s);
  col = col * 0.4 + 0.5;

  col = mix(col, col.yzx, n2 * 0.3);
  col = mix(col, col.zxy, n3 * 0.2);

  col = max(col, 0.15);
  col = pow(col, vec3(0.95));
  col = mix(col, vec3(0.55), 0.1);

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`
