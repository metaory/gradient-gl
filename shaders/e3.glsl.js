export default /* glsl */ `
vec2 warpUV(vec2 uv, float t) {
  float angle = length(uv) * 2.0 - t;
  return rot(angle) * uv;
}

vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale * 0.7;
  vec2 uv = (fragCoord - iResolution.xy * 0.5) / min(iResolution.x, iResolution.y) * 2.0;

  vec2 warped = warpUV(uv, t) * 0.5 + 0.5;

  vec3 col = mix(vec3(0.68, 0.1, 0.9), vec3(1.0, 0.68, 0.4), warped.x);
  col = mix(col, vec3(0.6, 0.8, 0.94), warped.y);
  col = col * col * 1.2;

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`

