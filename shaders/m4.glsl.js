export default /* glsl */ `
const float ANIMATION_SPEED = 1.33;
const float WAVE_INTENSITY = 1.0;
const float WAVE_COMPLEXITY = 1.0;
const float ROTATION_SPEED = 1.0;
const float ROTATION_AMOUNT = 1.0;
const vec4 PALETTE_A = vec4(0.814, 0.432, 0.758, 1.0);
const vec4 PALETTE_B = vec4(-0.442, 1.045, -0.759, 1.0);
const vec4 PALETTE_C = vec4(0.318, -0.121, -0.238, 1.0);
const vec4 PALETTE_D = vec4(-0.116, -0.763, -0.582, 1.0);
const float BLEND_SOFTNESS = 1.5;

vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(157.13, 113.47)), dot(p, vec2(271.19, 419.23)));
  return fract(sin(p) * 19371.5813);
}

float customNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash22(i) - 0.5, f);
  float b = dot(hash22(i + vec2(1.0, 0.0)) - 0.5, f - vec2(1.0, 0.0));
  float c = dot(hash22(i + vec2(0.0, 1.0)) - 0.5, f - vec2(0.0, 1.0));
  float d = dot(hash22(i + vec2(1.0, 1.0)) - 0.5, f - vec2(1.0, 1.0));
  return 0.5 + mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float blend_n3(float edge0, float edge1, float x) {
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

vec3 palette_n3(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale;
  vec2 uv = fragCoord / iResolution.xy;
  vec2 coord = uv - 0.5;
  coord.x *= iResolution.x / iResolution.y;

  float rotationNoise = customNoise(vec2(t * 0.05 * ANIMATION_SPEED * ROTATION_SPEED, coord.x * coord.y * 1.5));
  coord *= rot((rotationNoise - 0.5) * 4.0 * ROTATION_AMOUNT + t * 0.06 * ANIMATION_SPEED * ROTATION_SPEED);

  float waveTime = t * 0.8 * ANIMATION_SPEED;
  float freq1 = 2.5 * WAVE_COMPLEXITY;
  float freq2 = 3.2 * WAVE_COMPLEXITY;

  coord.x += sin(coord.y * freq1 + waveTime) * 0.15 * WAVE_INTENSITY;
  coord.y += cos(coord.x * freq2 + waveTime * 1.3) * 0.12 * WAVE_INTENSITY;
  coord.x += sin(coord.y * freq2 * 0.6 + waveTime * 0.7) * 0.08 * WAVE_INTENSITY;
  coord.y += cos(coord.x * freq1 * 1.8 + waveTime * 1.1) * 0.06 * WAVE_INTENSITY;

  vec3 a = PALETTE_A.rgb;
  vec3 b = PALETTE_B.rgb;
  vec3 c = PALETTE_C.rgb;
  vec3 d = PALETTE_D.rgb;

  vec3 colors[8];
  colors[0] = palette_n3(0.0, a, b, c, d);
  colors[1] = palette_n3(0.14, a, b, c, d);
  colors[2] = palette_n3(0.29, a, b, c, d);
  colors[3] = palette_n3(0.43, a, b, c, d);
  colors[4] = palette_n3(0.57, a, b, c, d);
  colors[5] = palette_n3(0.71, a, b, c, d);
  colors[6] = palette_n3(0.86, a, b, c, d);
  colors[7] = palette_n3(1.0, a, b, c, d);

  float blendRange = 0.7 * BLEND_SOFTNESS;

  float zone1 = blend_n3(-blendRange, blendRange, (coord * rot(0.3)).x);
  vec3 horizontalBlend1 = mix(colors[0], colors[1], zone1);

  float zone2 = blend_n3(-blendRange, blendRange, (coord * rot(-0.2)).x);
  vec3 horizontalBlend2 = mix(colors[2], colors[3], zone2);

  float zone3 = blend_n3(-blendRange, blendRange, (coord * rot(0.5)).x);
  vec3 horizontalBlend3 = mix(colors[4], colors[5], zone3);

  float zone4 = blend_n3(-blendRange, blendRange, (coord * rot(-0.4)).x);
  vec3 horizontalBlend4 = mix(colors[6], colors[7], zone4);

  float verticalZone1 = blend_n3(0.4 * BLEND_SOFTNESS, -0.2 * BLEND_SOFTNESS, coord.y + sin(coord.x * 2.0) * 0.15);
  vec3 blendPair1 = mix(horizontalBlend1, horizontalBlend2, verticalZone1);

  float verticalZone2 = blend_n3(0.2 * BLEND_SOFTNESS, -0.4 * BLEND_SOFTNESS, coord.y + sin(coord.x * 1.5) * 0.12);
  vec3 blendPair2 = mix(horizontalBlend3, horizontalBlend4, verticalZone2);

  float finalZone = blend_n3(0.1 * BLEND_SOFTNESS, -0.6 * BLEND_SOFTNESS, coord.y + sin(coord.x * 2.5) * 0.18);
  vec3 col = mix(blendPair1, blendPair2, finalZone);

  float texture1 = customNoise(coord * 6.0 + t * 0.03 * ANIMATION_SPEED) * 0.04;
  float texture2 = customNoise(coord * 12.0 - t * 0.02 * ANIMATION_SPEED) * 0.02;
  col += texture1 + texture2;

  col = pow(col, vec3(0.85));
  col = clamp(col, 0.0, 1.0);

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`

