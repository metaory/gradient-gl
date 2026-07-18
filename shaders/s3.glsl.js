export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale * 0.6;
  vec2 p = getUV(fragCoord);

  vec3 base = vec3(0.15, 0.4, 0.95);

  float n = fbm(p * 2.0, t, 3);
  float blob = sin(t * 0.4 + p.x * 2.5 + n * 1.8);
  blob += cos(t * 0.35 + p.y * 3.0 + n * 1.5);
  blob = blob * 0.25 + 0.5;

  float shade = S(0.2, 0.8, blob) * 0.6 + 0.4;
  vec3 col = base * shade;
  col += dotNoise(fragCoord, 0.03);

  return vec4(finalColor(col), 1.0);
}
`
