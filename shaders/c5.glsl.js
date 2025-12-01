export default /* glsl */ `
float hash_c5(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise_c5(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash_c5(i);
  float b = hash_c5(i + vec2(1.0, 0.0));
  float c = hash_c5(i + vec2(0.0, 1.0));
  float d = hash_c5(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm_c5(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise_c5(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  float t = iTime * timeScale;

  vec2 distortedUV = uv + 0.15 * vec2(
    fbm_c5(uv * 3.0 + t * 0.15),
    fbm_c5(uv.yx * 3.0 - t * 0.12 + 31.0)
  );

  float n1 = fbm_c5(distortedUV * 2.5 + t * 0.1);
  float n2 = fbm_c5(distortedUV * 2.0 - t * 0.08 + 5.0);
  float n3 = fbm_c5(distortedUV * 1.8 + t * 0.12 + 10.0);

  vec3 c1 = vec3(0.85, 0.35, 0.55);
  vec3 c2 = vec3(0.55, 0.4, 0.8);
  vec3 c3 = vec3(0.9, 0.7, 0.5);

  float w1 = n1 + sin(distortedUV.x * 3.0 + t * 0.3) * 0.2;
  float w2 = n2 + cos(distortedUV.y * 2.5 - t * 0.25) * 0.2;
  float w3 = n3 + sin((distortedUV.x - distortedUV.y) * 2.0 + t * 0.2) * 0.2;

  w1 = max(w1, 0.0);
  w2 = max(w2, 0.0);
  w3 = max(w3, 0.0);
  float wSum = w1 + w2 + w3 + 0.001;

  vec3 col = (c1 * w1 + c2 * w2 + c3 * w3) / wSum;

  col = mix(col, col.yzx, n1 * 0.1);

  col += (hash_c5(fragCoord.xy + floor(t)) - 0.5) / 255.0;

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`
