export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 p = (fragCoord * 2.0 - iResolution.xy) / (iResolution.x + iResolution.y) * 2.0;
  float t = iTime * timeScale * 0.7;

  float n1 = noise(p * 3.0 + t * 0.15);
  float n2 = noise(p * 2.0 - t * 0.1 + 5.0);

  float a = 3.0 * p.y - sin(-p.x * 2.5 + p.y - t * 0.8 + n1 * 0.6);
  a = a * 0.3 + n1 * 0.4 + n2 * 0.3;

  vec2 warped = vec2(
    cos(a * 2.0) * p.x + sin(a * 2.0) * p.y,
    cos(a * 1.8) * p.y - sin(a * 1.8) * p.x
  );
  warped = warped * 0.4 + 0.5;
  warped += vec2(n1 - 0.5, n2 - 0.5) * 0.15;

  vec3 color1 = vec3(0.55, 0.15, 0.9);
  vec3 color2 = vec3(0.9, 0.2, 0.5);
  vec3 color3 = vec3(0.2, 0.85, 0.85);

  float w1 = smoothstep(0.0, 1.0, warped.x + n1 * 0.2);
  float w2 = smoothstep(0.0, 1.0, warped.y + n2 * 0.2);

  vec3 col = mix(color1, color2, w1);
  col = mix(col, color3, w2 * 0.7);
  col = mix(col, col.zxy, n1 * n2 * 0.3);

  col = pow(col, vec3(0.92)) * 1.05;
  col = clamp(col, 0.0, 1.0);

  float dither = fract(sin(dot(fragCoord, vec2(12.9898, 78.233))) * 43758.5453);
  col += (dither - 0.5) / 128.0;

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`
