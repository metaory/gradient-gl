export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale * 0.6;
  vec2 p = getUV(fragCoord);

  vec3 c1 = vec3(0.92, 0.18, 0.15);
  vec3 c2 = vec3(0.18, 0.15, 0.92);

  float n1 = noise(p * 2.5 + t * 0.5);
  float n2 = noise(p * 1.8 - t * 0.4 + 3.0);

  vec2 sp = swirl(p, 1.2, t);
  sp = swirl(sp, 2.5, t * 0.75);

  float blend = S(0.2, 0.8, sp.x + sp.y + n1 * 0.25 + n2 * 0.15);

  vec3 col = mix(c1, c2, blend);
  col += dotNoise(fragCoord, 0.025);

  return vec4(finalColor(col), 1.0);
}
`
