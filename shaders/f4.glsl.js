export default /* glsl */ `
vec3 sampleColor(vec2 coord, float time, float freqMultiplier, vec3 offset) {
  return 0.5 + 0.5 * cos(time + coord.xyx * freqMultiplier + offset);
}

float hash_f4(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise_f4(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash_f4(i);
  float b = hash_f4(i + vec2(1.0, 0.0));
  float c = hash_f4(i + vec2(0.0, 1.0));
  float d = hash_f4(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm_f4(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise_f4(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  float t = iTime * timeScale;

  vec3 color1 = sampleColor(uv, t, 1.0, vec3(0, 2, 4));
  vec3 color2 = sampleColor(uv, t * 0.7, 2.0, vec3(1, 3, 5));

  vec3 baseColor = mix(color1, color2, 0.5 + 0.5 * sin(uv.x * 3.14 + t));

  vec3 themeColor = vec3(0.8, 0.18, 0.471);
  baseColor = mix(baseColor, themeColor, 0.6);

  vec2 distortedUV = uv * 0.5 + 0.5 * vec2(
    fbm_f4(uv + t * 0.2),
    fbm_f4(uv + t * 0.2 + 31.0)
  );

  vec3 color3 = sampleColor(distortedUV, 1.0, 1.0, vec3(0, 2, 4));
  vec3 color4 = sampleColor(distortedUV, t * 0.7, 2.0, vec3(1, 3, 5));

  vec3 col = mix(
    mix(color3, color4, 0.5 + 0.5 * sin((distortedUV.x + distortedUV.y) / 2.0 * 3.14 + t)),
    baseColor,
    0.7
  );

  col += 0.05 * vec3(
    0.5 + 0.5 * sin(uv.y * 10.0 + t),
    0.5 + 0.5 * sin(uv.x * 8.0 + t * 1.1),
    0.5 + 0.5 * sin((uv.x + uv.y) * 9.0 + t * 0.9)
  );

  col += (hash_f4(fragCoord.xy + floor(t)) - 0.5) / 255.0;

  float luminance = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(luminance), 0.75);

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`

