export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord.xy / iResolution.xy;
  float t = iTime * timeScale;

  vec3 c0 = vec3(0.92, 0.82, 0.57);
  vec3 c1 = vec3(0.49, 0.69, 0.66);
  vec3 c2 = vec3(0.99, 0.67, 0.54);
  vec3 c3 = vec3(0.86, 0.15, 0.25);

  float n = noise(uv * 3.0 + t * 0.3);

  vec2 P0 = vec2(0.15 + sin(t * 0.5) * 0.08, 0.25 + cos(t * 0.4) * 0.08);
  vec2 P1 = vec2(0.75 + cos(t * 0.6) * 0.08, 0.30 + sin(t * 0.5) * 0.08);
  vec2 P2 = vec2(0.25 + sin(t * 0.4) * 0.08, 0.75 + cos(t * 0.7) * 0.08);
  vec2 P3 = vec2(0.78 + cos(t * 0.5) * 0.08, 0.72 + sin(t * 0.6) * 0.08);

  vec2 Q = P0 - P2;
  vec2 R = P1 - P0;
  vec2 SS = R + P2 - P3;
  vec2 TT = P0 - uv;

  float u, tv;
  float A = SS.x * R.y - R.x * SS.y;
  float B = SS.x * TT.y - TT.x * SS.y + Q.x * R.y - R.x * Q.y;
  float C = Q.x * TT.y - TT.x * Q.y;

  if (abs(A) < 0.0001) {
    u = -C / B;
  } else {
    u = (-B + sqrt(max(B * B - 4.0 * A * C, 0.0))) / (2.0 * A);
  }
  tv = (TT.y + u * R.y) / (Q.y + u * SS.y + 0.0001);

  u = clamp(u, 0.0, 1.0);
  tv = clamp(tv, 0.0, 1.0);

  u = smoothstep(0.0, 1.0, u + n * 0.15);
  tv = smoothstep(0.0, 1.0, tv + n * 0.15);

  vec3 cA = mix(c0, c1, u);
  vec3 cB = mix(c2, c3, u);
  vec3 col = mix(cA, cB, tv);

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`

