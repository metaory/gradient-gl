export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale * 0.34;
  vec2 p = getUV(fragCoord) * 0.46;
  vec2 rnd = hash(vec2(floor(t * 0.14), 5.1));

  vec2 q = swirl(p + (rnd - 0.5) * 0.15, 1.55 + rnd.x * 0.4, t * 0.58);
  q += (vec2(fbm(q * 0.88 + 2.0, t * 0.27, 5), fbm(q * 0.88 + 6.2, -t * 0.33, 5)) - 0.5) * 0.85;
  q += (vec2(noise(q * 1.5 - t * 0.46), noise(q.yx * 1.5 + t * 0.38 + 8.0)) - 0.5) * 0.42;
  q = q * rot(fbm(q * 0.55 + rnd, t * 0.19, 3) * 1.3 - 0.65);

  float a = fbm(q * 1.25 + vec2(-t * 0.21, t * 0.14) + rnd.yx, t * 0.17, 6);
  float b = fbm(q * 1.65 + vec2(t * 0.25, t * 0.34) + 7.0, t * 0.26, 5);
  float c = fbm(q.yx * 1.95 + vec2(-t * 0.17, -t * 0.3) + 13.0, t * 0.23, 5);
  float rip = fbm(q * 3.0 + a * 1.8 - t * 0.48, t * 0.38, 4);

  a = a + rip * 0.26 - 0.1;
  b = b + noise(q * 3.4 + t * 0.52) * 0.3 - 0.07;
  c = c + noise(q.yx * 3.9 - t * 0.36) * 0.28 - 0.09;

  float eA = S(0.36, 0.66, a);
  float eB = S(0.38, 0.68, b);
  float eC = S(0.4, 0.7, c);

  float wA = pow(eA, 2.1);
  float wB = pow(eB, 2.4) * (0.9 + rnd.x * 0.3);
  float wC = pow(eC, 2.2) * (0.9 + rnd.y * 0.3);
  float wn = wA + wB + wC + 0.001;

  vec3 c1 = vec3(0.1, 0.55, 0.72);
  vec3 c2 = vec3(0.92, 0.28, 0.22);
  vec3 c3 = vec3(0.55, 0.2, 0.85);
  vec3 bg = vec3(0.04, 0.07, 0.1);

  vec3 islands = (c1 * wA + c2 * wB + c3 * wC) / wn;
  float cover = S(0.1, 0.74, clamp(wA + wB + wC, 0.0, 1.0));
  vec3 col = mix(bg, islands, cover);
  col += dotNoise(fragCoord, 0.032);

  return vec4(finalColor(col), 1.0);
}
`
