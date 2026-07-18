export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale * 0.35;
  vec2 p = getUV(fragCoord) * 0.48;

  vec2 q = swirl(p, 1.7, t * 0.6);
  q += (vec2(fbm(q * 0.9 + 2.0, t * 0.28, 5), fbm(q * 0.9 + 6.5, -t * 0.34, 5)) - 0.5) * 0.85;
  q += (vec2(noise(q * 1.6 - t * 0.47), noise(q.yx * 1.6 + t * 0.39 + 9.0)) - 0.5) * 0.4;
  q = q * rot(fbm(q * 0.6, t * 0.2, 3) * 1.4 - 0.7);

  float a = fbm(q * 1.3 + vec2(-t * 0.22, t * 0.14), t * 0.18, 6);
  float b = fbm(q * 1.7 + vec2(t * 0.26, t * 0.35) + 7.0, t * 0.27, 5);
  float c = fbm(q.yx * 2.0 + vec2(-t * 0.18, -t * 0.31) + 13.0, t * 0.24, 5);
  float rip = fbm(q * 3.2 + a * 2.0 - t * 0.5, t * 0.4, 4);

  a = a + rip * 0.3 - 0.12;
  b = b + noise(q * 3.6 + t * 0.55) * 0.35 - 0.08;
  c = c + noise(q.yx * 4.2 - t * 0.38) * 0.32 - 0.1;

  float eA = S(0.38, 0.68, a);
  float eB = S(0.4, 0.7, b);
  float eC = S(0.42, 0.72, c);

  float wA = pow(eA, 2.2);
  float wB = pow(eB, 2.8);
  float wC = pow(eC, 2.4);
  float wn = wA + wB + wC + 0.001;

  vec3 c1 = vec3(0.1, 0.55, 0.72);
  vec3 c2 = vec3(0.92, 0.28, 0.22);
  vec3 c3 = vec3(0.55, 0.2, 0.85);
  vec3 bg = vec3(0.04, 0.07, 0.1);

  vec3 islands = (c1 * wA + c2 * wB + c3 * wC) / wn;
  float cover = S(0.12, 0.75, clamp(wA + wB + wC, 0.0, 1.0));
  vec3 col = mix(bg, islands, cover);
  col += dotNoise(fragCoord, 0.035);

  return vec4(finalColor(col), 1.0);
}
`
