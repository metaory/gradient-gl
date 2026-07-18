export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale * 0.4;
  vec2 p = getUV(fragCoord) * 0.55;

  vec2 q = p * rot(noise(p * 0.5 + t * 0.15) * 2.0 - 1.0);
  q += (vec2(fbm(q * 1.1, t * 0.37, 5), fbm(q * 1.1 + 4.2, -t * 0.29, 5)) - 0.5) * 0.7;
  q += (vec2(noise(q * 2.0 + t * 0.53), noise(q.yx * 2.0 - t * 0.41 + 7.0)) - 0.5) * 0.5;

  float a = fbm(q * 1.6 + vec2(t * 0.19, -t * 0.27), t * 0.22, 6);
  float b = fbm(q * 1.9 + vec2(-t * 0.31, t * 0.17) + 5.0, t * 0.33, 5);
  float c = fbm(q.yx * 2.2 + vec2(t * 0.23, t * 0.41) + 11.0, -t * 0.28, 5);
  float spit = noise(q * 3.5 + a * 3.0 + t * 0.6);

  a = a + spit * 0.25 - 0.15;
  b = b + noise(q * 4.0 - t * 0.5) * 0.3 - 0.1;
  c = c + noise(q.yx * 3.8 + t * 0.45) * 0.28 - 0.12;

  float eA = S(0.42, 0.62, a);
  float eB = S(0.44, 0.64, b);
  float eC = S(0.46, 0.66, c);

  float wA = pow(eA, 2.5);
  float wB = pow(eB, 2.5);
  float wC = pow(eC, 2.5);
  float wn = wA + wB + wC + 0.001;

  vec3 c1 = vec3(0.18, 0.35, 0.9);
  vec3 c2 = vec3(0.85, 0.15, 0.55);
  vec3 c3 = vec3(0.9, 0.7, 0.15);
  vec3 bg = vec3(0.05, 0.06, 0.12);

  vec3 islands = (c1 * wA + c2 * wB + c3 * wC) / wn;
  float cover = clamp(wA + wB + wC, 0.0, 1.0);
  cover = S(0.15, 0.7, cover);
  vec3 col = mix(bg, islands, cover);
  col += dotNoise(fragCoord, 0.04);

  return vec4(finalColor(col), 1.0);
}
`
