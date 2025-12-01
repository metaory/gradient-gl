export default /* glsl */ `
float colormap_red(float x) {
  if (x < 0.0) return 54.0 / 255.0;
  if (x < 20049.0 / 82979.0) return (829.79 * x + 54.51) / 255.0;
  return 1.0;
}

float colormap_green(float x) {
  if (x < 20049.0 / 82979.0) return 0.0;
  if (x < 327013.0 / 810990.0) return (8546482679670.0 / 10875673217.0 * x - 2064961390770.0 / 10875673217.0) / 255.0;
  if (x <= 1.0) return (103806720.0 / 483977.0 * x + 19607415.0 / 483977.0) / 255.0;
  return 1.0;
}

float colormap_blue(float x) {
  if (x < 0.0) return 54.0 / 255.0;
  if (x < 7249.0 / 82979.0) return (829.79 * x + 54.51) / 255.0;
  if (x < 20049.0 / 82979.0) return 127.0 / 255.0;
  if (x < 327013.0 / 810990.0) return (792.02249341361393720147485376583 * x - 64.364790735602331034989206222672) / 255.0;
  return 1.0;
}

vec4 colormap(float x) {
  return vec4(colormap_red(x), colormap_green(x), colormap_blue(x), 1.0);
}

float rand_e1(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise_e1(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);
  float res = mix(
    mix(rand_e1(ip), rand_e1(ip + vec2(1.0, 0.0)), u.x),
    mix(rand_e1(ip + vec2(0.0, 1.0)), rand_e1(ip + vec2(1.0, 1.0)), u.x), u.y);
  return res * res;
}

float fbm(vec2 p, float t) {
  mat2 mtx = mat2(0.80, 0.60, -0.60, 0.80);
  float f = 0.0;
  f += 0.500000 * noise_e1(p + t); p = mtx * p * 2.02;
  f += 0.031250 * noise_e1(p); p = mtx * p * 2.01;
  f += 0.250000 * noise_e1(p); p = mtx * p * 2.03;
  f += 0.125000 * noise_e1(p); p = mtx * p * 2.01;
  f += 0.062500 * noise_e1(p); p = mtx * p * 2.04;
  f += 0.015625 * noise_e1(p + sin(t));
  return f / 0.96875;
}

float pattern(vec2 p, float t) {
  return fbm(p + fbm(p + fbm(p, t), t), t);
}

vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale;
  vec2 uv = fragCoord / iResolution.x;
  float shade = pattern(uv, t);

  vec3 col = colormap(shade).rgb;
  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, shade);
}
`

