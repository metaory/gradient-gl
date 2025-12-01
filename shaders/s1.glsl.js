export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord.xy / iResolution.xy;
  float t = iTime * timeScale;

  vec2 p[4];
  p[0] = vec2(0.2 + sin(t * 0.7) * 0.15, 0.8 + cos(t * 0.5) * 0.1);
  p[1] = vec2(0.8 + cos(t * 0.6) * 0.15, 0.85 + sin(t * 0.8) * 0.1);
  p[2] = vec2(0.5 + sin(t * 0.4) * 0.2, 0.15 + cos(t * 0.9) * 0.1);
  p[3] = vec2(cos(t) * 0.35 + 0.5, sin(t * 0.8) * 0.35 + 0.5);

  float cs = sin(t * 0.6) * 0.15;
  vec3 c[4];
  c[0] = vec3(0.95 + cs, 0.35, 0.34);
  c[1] = vec3(0.95, 0.65 + cs, 0.18);
  c[2] = vec3(0.18, 0.82 + cs, 0.86);
  c[3] = vec3(0.9 + cs * 0.5, 0.9, 0.2);

  vec3 sum = vec3(0.0);
  float valence = 0.0;
  for (int i = 0; i < 4; i++) {
    float d = length(uv - p[i]);
    d = max(d, 0.001);
    float w = 1.0 / pow(d, 2.2);
    sum += w * c[i];
    valence += w;
  }
  sum /= valence;
  sum = pow(sum, vec3(1.0 / 2.2));

  sum = applyHueShift(sum, hueShift);
  sum = applySaturation(sum, saturation);
  sum = applyLightness(sum, lightness);

  return vec4(sum, 1.0);
}
`

