export default /* glsl */ `
vec3 palette_t4(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.6, 0.6, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.1, 0.2);
  return a + b * cos(TAU * (c * t + d));
}

float smooth_noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = dot(hash(i), f);
  float b = dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return 0.5 + 0.5 * mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm_t4(vec2 p, float t) {
  float f = 0.0;
  float amp = 0.6;
  mat2 m = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 3; i++) {
    f += amp * smooth_noise(p + t * 0.15);
    p = m * p * 1.5;
    amp *= 0.5;
  }
  return f;
}

vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale * 0.5;
  vec2 uv = fragCoord.xy / iResolution.xy;
  float ar = iResolution.x / iResolution.y;
  vec2 p = (uv - 0.5) * vec2(ar, 1.0);

  float n1 = fbm_t4(p * 1.8, t);
  float n2 = fbm_t4(p * 1.8 + vec2(5.2, 1.3), t * 1.1);
  float n3 = fbm_t4(p * 1.5 + vec2(1.7, 9.2), t * 0.9);

  vec2 warp = p + vec2(n1, n2) * 0.5;
  float w1 = fbm_t4(warp * 2.0, t * 0.8);
  float w2 = fbm_t4(warp * 1.6 + n3 * 0.3, t * 0.7);

  float blend = w1 * 0.5 + w2 * 0.3 + n1 * 0.2;
  blend = blend * 2.0 + t * 0.07;

  vec3 c1 = palette_t4(blend);
  vec3 c2 = palette_t4(blend + 0.25);
  vec3 c3 = palette_t4(blend + 0.5);

  vec3 col = c1;
  col = mix(col, c2, smoothstep(0.2, 0.8, w1));
  col = mix(col, c3, smoothstep(0.2, 0.8, w2));

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`

