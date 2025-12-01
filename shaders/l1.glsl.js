export default /* glsl */ `
vec2 swirl_b4(vec2 uv, float seed, float t) {
  float n = fract(sin(seed * 127.1) * 43758.5453);
  vec2 center = vec2(0.5) + vec2(cos(t * 0.4 + n * 6.28), sin(t * 0.5 + n * 3.14)) * 0.4;
  vec2 d = uv - center;
  float dist = length(d);
  float strength = smoothstep(0.0, 1.0, exp(dist * -2.5) * (cos(dist * 8.0) * 0.5 + 0.5));
  float angle = strength * sin(t * 0.6 + n * 6.28) * 5.0;
  return center + d * rot(angle);
}

vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale;
  float ar = iResolution.x / iResolution.y;
  vec2 uv = (fragCoord / iResolution.xy - 0.5) * vec2(ar, 1.0) + 0.5;
  vec2 sv = uv;

  for (int i = 0; i < 4; i++) {
    sv = swirl_b4(sv, float(i + 1) * 0.37, t);
  }

  vec3 c1 = vec3(1.0, 0.45, 0.1);
  vec3 c2 = vec3(0.55, 0.1, 0.95);
  vec3 c3 = vec3(0.2, 0.8, 0.9);
  
  vec3 col = mix(c1, c2, sv.y);
  col = mix(col, c3, sv.x * 0.5);

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`

