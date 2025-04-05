export default /* glsl */ `
vec3 hash3d(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)),
          dot(p, vec3(113.5, 271.9, 124.6)));
  p = -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  return p;
}

float noise3d(in vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
      mix(mix(dot(hash3d(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
              dot(hash3d(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)),
              u.x),
          mix(dot(hash3d(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
              dot(hash3d(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)),
              u.x),
          u.y),
      mix(mix(dot(hash3d(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
              dot(hash3d(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)),
              u.x),
          mix(dot(hash3d(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
              dot(hash3d(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)),
              u.x),
          u.y),
      u.z);
}

vec4 shader(vec2 fragCoord) {
  const int layers = 5;
  const float baseSpeed = 0.25; // Base speed
  const float scale = 1.2;

  vec2 uv = (fragCoord - iResolution.xy - .5) / iResolution.y;
  float t = iTime * baseSpeed * timeScale; // Use timeScale for dynamic speed
  uv *= scale;
  float h =
      noise3d(vec3(uv * 2., t)); // Time as z-coordinate for continuous noise
  for (int n = 1; n < layers; n++) {
    float i = float(n);
    uv -= vec2(0.7 / i * sin(i * uv.y + i + t * 2.0 + h * i) +
                  0.8, // Reduced from 5.0 to 2.0
              0.4 / i * sin(uv.x + 4. - i + h + t * 2.0 + 0.3 * i) +
                  1.6); // Reduced from 5.0 to 2.0
  }
  uv -=
      vec2(1.2 * sin(uv.x + t + h) + 1.8, 0.4 * sin(uv.y + t + 0.3 * h) + 1.6);
  vec3 col = vec3(.5 * sin(uv.x) + 0.5, .5 * sin(uv.x + uv.y) + 0.5,
                  .5 * sin(uv.y) + 0.8) *
            0.8;

  // Apply hue shift to the final color
  col = applyHueShift(col, hueShift);

  // Apply saturation adjustment
  col = applySaturation(col, saturation);

  // Apply lightness adjustment
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`
