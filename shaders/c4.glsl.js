export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale * 0.6;
  vec2 p = getUV(fragCoord);

  vec3 c1 = vec3(0.12, 0.25, 0.92);
  vec3 c2 = vec3(0.92, 0.18, 0.45);

  float n1 = noise(p * 3.0 + t * 0.5);
  float n2 = noise(p * 2.2 - t * 0.4 + 7.0);

  float wave = sin((p.x + p.y) * 3.5 + t * 0.9 + n1 * 2.5);
  wave += cos((p.x - p.y) * 2.8 - t * 0.7 + n2 * 2.0);
  float blend = S(-0.6, 0.6, wave * 0.5 + n1 * 0.2);

  vec3 col = mix(c1, c2, blend);
  col += dotNoise(fragCoord, 0.025);

  return vec4(finalColor(col), 1.0);
}
`
