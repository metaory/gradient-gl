export default /* glsl */ `
const vec3 BASE_EXPOSURE = vec3(0.814, 0.432, 0.758);
const vec3 BASE_CONTRAST = vec3(-0.442, 1.045, -0.759);
const vec3 BASE_FREQ = vec3(0.318, -0.121, -0.238);
const vec3 BASE_PHASE = vec3(-0.116, -0.763, -0.582);

const int ZOOM = 40;
const float ANIMATION_SPEED = 0.6;
const float WARP_INTENSITY = 1.25;
const float PALETTE_CHANGE_SPEED = 0.05;

vec3 palette_e4(float t, vec3 exposure, vec3 contrast, vec3 freq, vec3 phase) {
  return exposure + contrast * cos(TAU * (freq * t + phase));
}

float cosRange(float amt, float range, float minimum) {
  return (((1.0 + cos(radians(amt))) * 0.5) * range) + minimum;
}

vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale;
  float time = t * ANIMATION_SPEED;

  vec2 uv = fragCoord.xy / iResolution.xy;
  vec2 p = (2.0 * fragCoord.xy - iResolution.xy) / max(iResolution.x, iResolution.y);

  float ct = cosRange(time * 5.0, 3.0, 1.1);
  float xBoost = cosRange(time * 0.2, 5.0, 5.0);
  float yBoost = cosRange(time * 0.1, 10.0, 5.0);
  float fScale = cosRange(time * 15.5, 1.25, 0.5);

  for (int i = 1; i < ZOOM; i++) {
    float _i = float(i);
    vec2 newp = p;
    newp.x += 0.25 / _i * sin(_i * p.y + time * cos(ct) * 0.5 / 20.0 + 0.005 * _i) * fScale * WARP_INTENSITY + xBoost;
    newp.y += 0.25 / _i * sin(_i * p.x + time * ct * 0.3 / 40.0 + 0.03 * float(i + 15)) * fScale * WARP_INTENSITY + yBoost;
    p = newp;
  }

  float gradientInput = (sin(p.x * 3.0) + sin(p.y * 3.0) + sin((p.x + p.y) * 2.0)) * 0.25 + 0.5;

  float cycleTime = t * PALETTE_CHANGE_SPEED;
  float totalProgress = mod(cycleTime, 6.0);
  float currentIndex = floor(totalProgress);
  float blend = fract(totalProgress);

  vec3 swizzles[6];
  swizzles[0] = vec3(0.0, 1.0, 2.0);
  swizzles[1] = vec3(0.0, 2.0, 1.0);
  swizzles[2] = vec3(1.0, 0.0, 2.0);
  swizzles[3] = vec3(1.0, 2.0, 0.0);
  swizzles[4] = vec3(2.0, 0.0, 1.0);
  swizzles[5] = vec3(2.0, 1.0, 0.0);

  int idx1 = int(currentIndex);
  int idx2 = int(mod(currentIndex + 1.0, 6.0));

  vec3 swizzle1 = swizzles[idx1];
  vec3 swizzle2 = swizzles[idx2];

  vec3 exp1 = vec3(BASE_EXPOSURE[int(swizzle1.x)], BASE_EXPOSURE[int(swizzle1.y)], BASE_EXPOSURE[int(swizzle1.z)]);
  vec3 con1 = vec3(BASE_CONTRAST[int(swizzle1.x)], BASE_CONTRAST[int(swizzle1.y)], BASE_CONTRAST[int(swizzle1.z)]);
  vec3 freq1 = vec3(BASE_FREQ[int(swizzle1.x)], BASE_FREQ[int(swizzle1.y)], BASE_FREQ[int(swizzle1.z)]);
  vec3 phase1 = vec3(BASE_PHASE[int(swizzle1.x)], BASE_PHASE[int(swizzle1.y)], BASE_PHASE[int(swizzle1.z)]);

  vec3 exp2 = vec3(BASE_EXPOSURE[int(swizzle2.x)], BASE_EXPOSURE[int(swizzle2.y)], BASE_EXPOSURE[int(swizzle2.z)]);
  vec3 con2 = vec3(BASE_CONTRAST[int(swizzle2.x)], BASE_CONTRAST[int(swizzle2.y)], BASE_CONTRAST[int(swizzle2.z)]);
  vec3 freq2 = vec3(BASE_FREQ[int(swizzle2.x)], BASE_FREQ[int(swizzle2.y)], BASE_FREQ[int(swizzle2.z)]);
  vec3 phase2 = vec3(BASE_PHASE[int(swizzle2.x)], BASE_PHASE[int(swizzle2.y)], BASE_PHASE[int(swizzle2.z)]);

  vec3 col1 = palette_e4(gradientInput, exp1, con1, freq1, phase1);
  vec3 col2 = palette_e4(gradientInput, exp2, con2, freq2, phase2);
  vec3 col = mix(col1, col2, blend);

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  float extrusion = (col.x + col.y + col.z) / 4.0 * 1.5;

  return vec4(col, extrusion);
}
`

