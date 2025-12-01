export default /* glsl */ `
float noise_c1(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash(i), f);
  float b = dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return 0.5 + 0.5 * mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm_c1(vec2 p, float t) {
  mat2 m = mat2(0.8, 0.6, -0.6, 0.8);
  float f = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 4; i++) {
    f += amp * noise_c1(p * freq + t * 0.3);
    p = m * p;
    freq *= 1.6;
    amp *= 0.5;
  }
  return f;
}

vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale * 0.4;
  vec2 uv = fragCoord / iResolution.xy;
  float ar = iResolution.x / iResolution.y;
  uv.x *= ar;

  float n1 = fbm_c1(uv * 3.0, t);
  float n2 = fbm_c1(uv * 3.0 + vec2(5.2, 1.3), t * 0.8);
  float n3 = fbm_c1(uv * 2.0 - vec2(1.7, 9.2), t * 0.6);

  vec3 c1 = vec3(0.95, 0.6, 0.5);
  vec3 c2 = vec3(0.6, 0.4, 0.85);
  vec3 c3 = vec3(0.4, 0.75, 0.9);
  vec3 c4 = vec3(0.9, 0.85, 0.5);

  float w1 = n1 + sin(uv.x * 2.0 + t * 0.5) * 0.3;
  float w2 = n2 + cos(uv.y * 2.5 - t * 0.4) * 0.3;
  float w3 = n3 + sin((uv.x + uv.y) * 1.5 + t * 0.3) * 0.25;
  float w4 = 1.0 - (w1 + w2 + w3) / 3.0;

  w1 = max(w1, 0.0);
  w2 = max(w2, 0.0);
  w3 = max(w3, 0.0);
  w4 = max(w4, 0.0);
  float wSum = w1 + w2 + w3 + w4 + 0.001;

  vec3 col = (c1 * w1 + c2 * w2 + c3 * w3 + c4 * w4) / wSum;
  col = mix(col, col.yzx, n3 * 0.12);

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`
