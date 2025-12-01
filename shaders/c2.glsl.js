export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  float ar = iResolution.x / iResolution.y;
  float t = iTime * timeScale;

  vec2 p1 = uv * 2.0;
  p1.x *= ar;
  vec2 p2 = uv * 3.0;
  p2.x *= ar;

  float n1 = noise(p1 + t * 0.4);
  float n2 = noise(p2 - t * 0.5);
  float n3 = noise(p1 * 0.5 + t * 0.6);

  float blend = (n1 + n2 + n3) / 3.0;

  vec3 color = vec3(
    n1 * 0.6 + 0.4,
    n2 * 0.6 + 0.4,
    blend * 0.6 + 0.4
  );

  vec2 rotUV = uv * rot(t * 0.2);
  rotUV.x *= ar;
  float rn = noise(rotUV * 2.0);
  color = mix(color, color.yzx, rn * 0.4);

  color = applyHueShift(color, hueShift);
  color = applySaturation(color, saturation);
  color = applyLightness(color, lightness);

  return vec4(color, 1.0);
}
`

