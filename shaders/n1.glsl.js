export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale * 0.4;
  vec2 p = getUV(fragCoord) * 0.52;
  vec2 rnd = hash(vec2(floor(t * 0.18), 2.7));

  vec2 q = p * rot(noise(p * 0.45 + t * 0.14 + rnd) * 1.8 - 0.9);
  q += (vec2(fbm(q * 1.0 + rnd.x, t * 0.35, 5), fbm(q * 1.0 + 4.0 + rnd.y, -t * 0.28, 5)) - 0.5) * 0.7;
  q += (vec2(noise(q * 1.85 + t * 0.5), noise(q.yx * 1.85 - t * 0.38 + 6.0)) - 0.5) * 0.48;

  float a = fbm(q * 1.5 + vec2(t * 0.18, -t * 0.25) + rnd, t * 0.21, 6);
  float b = fbm(q * 1.8 + vec2(-t * 0.3, t * 0.16) + 5.0, t * 0.32, 5);
  float c = fbm(q.yx * 2.1 + vec2(t * 0.22, t * 0.4) + 11.0, -t * 0.27, 5);
  float spit = noise(q * 3.2 + a * 2.5 + t * 0.55);

  a = a + spit * 0.22 - 0.12;
  b = b + noise(q * 3.7 - t * 0.48) * 0.26 - 0.08;
  c = c + noise(q.yx * 3.4 + t * 0.42) * 0.24 - 0.1;

  float eA = S(0.38, 0.64, a);
  float eB = S(0.4, 0.66, b);
  float eC = S(0.42, 0.68, c);

  float wA = pow(eA, 2.0) * (0.9 + rnd.x * 0.25);
  float wB = pow(eB, 2.0) * (0.9 + rnd.y * 0.25);
  float wC = pow(eC, 2.0);
  float wn = wA + wB + wC + 0.001;

  vec3 c1 = vec3(0.18, 0.35, 0.9);
  vec3 c2 = vec3(0.85, 0.15, 0.55);
  vec3 c3 = vec3(0.9, 0.7, 0.15);
  vec3 bg = vec3(0.06, 0.06, 0.12);

  vec3 islands = (c1 * wA + c2 * wB + c3 * wC) / wn;
  float cover = S(0.12, 0.72, clamp(wA + wB + wC, 0.0, 1.0));
  vec3 col = mix(bg, islands, cover);
  col += dotNoise(fragCoord, 0.035);

  return vec4(finalColor(col), 1.0);
}
`
