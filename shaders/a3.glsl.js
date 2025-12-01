export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  float mr = min(iResolution.x, iResolution.y);
  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / mr;
  uv.x *= .50;
  uv.x = sin(uv.x * 1.5 + .5) * .7;
  uv.y = 1.0 - uv.y;

  float t = iTime * timeScale;
  float d = -t * 0.5;

  float a = sin(uv.x * cos(uv.y + d));
  float b = cos(uv.x * cos(uv.y * a - d));

  float steps = 3.0;
  for (float i = 1.0; i <= steps; i++) {
    float k = (steps - i) / steps;
    a += sin(uv.y - k + i / cos(b / steps / 2.0));
    b += cos(uv.x + .5 + a * i + sin(d / steps));
  }

  a = cos(b);
  b = sin(b);
  float s = uv.x * a + uv.y * a + uv.x * b + uv.y * b;

  vec3 col = vec3(a, b, s);
  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`

