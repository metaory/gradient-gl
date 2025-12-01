export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  float t = iTime * timeScale;

  vec3 color1 = vec3(0.592, 0.588, 0.941);
  vec3 color2 = vec3(0.984, 0.780, 0.831);

  float blob = 0.0;
  blob += 0.5 * sin(t * 0.5 + 6.0 * (uv.x + 0.4 * sin(t * 0.3 + uv.y * 4.0)));
  blob += 0.3 * sin(t * 0.7 + 8.0 * (uv.y + 0.3 * sin(t * 0.4 + uv.x * 5.0)));
  blob += 0.2 * sin(t * 0.3 + 10.0 * length(uv - vec2(0.5) + 0.2 * vec2(sin(t), cos(t * 0.7))));

  blob = 0.5 + 0.5 * blob;

  vec3 col = mix(color1, color2, blob);

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`

