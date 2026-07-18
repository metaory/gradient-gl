export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale * 0.6;
  vec2 p = getUV(fragCoord);

  vec3 c1 = vec3(0.88, 0.22, 0.55);
  vec3 c2 = vec3(0.22, 0.55, 0.88);

  float n1 = noise(p * 2.8 + t * 0.45);
  float n2 = noise(p * 2.0 - t * 0.35 + 4.0);

  float a = sin(p.x * 2.5 + t * 0.8 + n1 * 2.0);
  float b = cos(p.y * 2.2 - t * 0.7 + n2 * 1.8);
  float c = sin((p.x + p.y) * 1.8 + t * 0.5);

  float blend = S(-0.5, 0.5, (a + b + c) * 0.33 + n1 * 0.2);

  vec3 col = mix(c1, c2, blend);
  col += dotNoise(fragCoord, 0.025);

  return vec4(finalColor(col), 1.0);
}
`
