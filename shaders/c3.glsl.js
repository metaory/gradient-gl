export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  float ar = iResolution.x / iResolution.y;
  float t = iTime * timeScale;

  vec2 p = uv * 2.0;
  p.x *= ar;
  p = p * rot(t * 0.15);

  float n1 = noise(p + t * 0.4);
  float n2 = noise(p * 0.6 - t * 0.5);
  float n3 = noise(p * 0.3 + t * 0.6);

  vec3 color = vec3(
    n1 * n2 + 0.2,
    n2 * n3 + 0.2,
    n3 * n1 + 0.2
  );

  vec2 flow = vec2(sin(t * 0.3), cos(t * 0.4)) * 0.3;
  flow.x *= ar;
  float fn = noise(uv * 2.0 + flow);
  color = mix(color, color.zxy, fn * 0.5);

  color = applyHueShift(color, hueShift);
  color = applySaturation(color, saturation);
  color = applyLightness(color, lightness);

  return vec4(color, 1.0);
}
`

