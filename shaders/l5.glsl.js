export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale * 0.65;
  vec2 p = getUV(fragCoord);

  vec3 c1 = vec3(0.28, 0.12, 0.92);
  vec3 c2 = vec3(0.92, 0.22, 0.18);

  float n1 = noise(p * 3.0 + t * 0.5);
  float n2 = noise(p * 2.2 - t * 0.4 + 6.0);

  vec2 mesh = p;
  mesh.x += sin(p.y * 4.2 + t * 0.9 + n1 * 2.2) * 0.14;
  mesh.y += cos(p.x * 3.8 - t * 0.8 + n2 * 2.0) * 0.12;

  float pattern = sin(mesh.x * 4.2 + t * 0.5) * cos(mesh.y * 3.8 - t * 0.4);
  float blend = S(-0.35, 0.35, pattern + n1 * 0.25);

  vec3 col = mix(c1, c2, blend);
  col += dotNoise(fragCoord, 0.025);

  return vec4(finalColor(col), 1.0);
}
`
