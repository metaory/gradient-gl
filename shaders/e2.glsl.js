export default /* glsl */ `
float n21(vec2 p) {
  return fract(sin(dot(p, vec2(13.12, 69.0))) * 42000.0);
}

#define RATIO (iResolution.x / iResolution.y)
#define E2_POINTS 3
#define E2_FORCE 2.0
#define E2_ROTATION 4.0

vec2 swirl(vec2 uv, float seed, float t) {
  float tm = t * 0.03;
  float n = n21(vec2(seed));
  vec2 pnt = vec2(0.5) + vec2(cos(tm + n * 423.1), sin(tm + n * 254.3)) * 0.5;
  vec2 dif = uv - pnt;
  float dis = length(dif);
  float frc = smoothstep(0.0, 1.0, exp(dis * -E2_FORCE) * (cos(dis * 10.0) * 0.5 + 0.5));
  float swl = frc * sin(tm + n * 624.8) * E2_ROTATION;
  return pnt + dif * rot(swl);
}

vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale;
  vec2 uv = (fragCoord / iResolution.xy - 0.5) * vec2(RATIO, 1.0) + 0.5;
  vec2 sv = uv;

  for (int i = 0; i < E2_POINTS; i++) {
    sv = swirl(sv, fract(float(i + 1) * 123.45), t);
  }

  vec3 orange = vec3(1.0, 0.5, 0.0);
  vec3 purple = vec3(0.5, 0.0, 1.0);
  vec3 col = mix(orange, purple, sv.y);

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`

