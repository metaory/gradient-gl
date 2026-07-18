export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale * 0.5;
  vec2 p = getUV(fragCoord);

  vec3 c1 = vec3(0.92, 0.12, 0.2);
  vec3 c2 = vec3(0.12, 0.18, 0.92);

  float n1 = noise(p * 2.5 + t * 0.4);
  float n2 = noise(p * 1.8 + vec2(5.0, 3.0) - t * 0.35);

  vec2 flow = p + vec2(n1 - 0.5, n2 - 0.5) * 0.3;
  float blend = S(0.2, 0.8, flow.x + sin(flow.y * 2.5 + t * 0.6) * 0.25 + 0.5);

  vec3 col = mix(c1, c2, blend);
  col += dotNoise(fragCoord, 0.025);

  return vec4(finalColor(col), 1.0);
}
`
