export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 p = (fragCoord * 2.0 - iResolution.xy) / (iResolution.x + iResolution.y) * 2.0;
  float t = iTime * timeScale * 0.7;

  float a = 4.0 * p.y - sin(-p.x * 3.0 + p.y - t);
  a = smoothstep(
    cos(a) * 0.7,
    sin(a) * 0.7 + 1.0,
    cos(a - 4.0 * p.y) - sin(a + 3.0 * p.x)
  );

  vec2 warped = cos(a) * p + sin(a) * vec2(-p.y, p.x);
  warped = warped * 0.5 + 0.5;

  vec3 color1 = vec3(0.55, 0.0, 1.0);
  vec3 color2 = vec3(1.0, 0.0, 0.5);
  vec3 color3 = vec3(0.0, 1.0, 1.0);
  vec3 col = mix(color1, color2, warped.x);
  col = mix(col, color3, warped.y);
  col *= col + 0.6 * sqrt(col);

  col = clamp(col, 0.0, 1.0);
  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`

