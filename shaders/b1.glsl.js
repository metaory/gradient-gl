export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord.xy / iResolution.xy;
  vec2 p[4];
  p[0] = vec2(0.1, 0.9);
  p[1] = vec2(0.9, 0.9);
  p[2] = vec2(0.5, 0.1);
  float t = iTime * timeScale;  // Use timeScale for dynamic speed
  p[3] = vec2(cos(t), sin(t)) * 0.4 + vec2(0.5, 0.5);
  vec3 c[4];
  // Add subtle color animation
  float colorShift = sin(t * 0.2) * 0.1;  // Slow color cycling
  c[0] = vec3(0.996078431372549 + colorShift, 0.3411764705882353, 0.33725490196078434);
  c[1] = vec3(0.996078431372549, 0.6352941176470588 + colorShift, 0.1607843137254902);
  c[2] = vec3(0.1450980392156863, 0.8196078431372549, 0.8588235294117647 + colorShift);
  c[3] = vec3(1.0, 1.0, 0.0);
  float blend = 2.0;
  vec3 sum = vec3(0.0);
  float valence = 0.0;
  for (int i = 0; i < 4; i++) {
      float distance = length(uv - p[i]);
      if (distance == 0.0) { distance = 1.0; }
      float w =  1.0 / pow(distance, blend);
      sum += w * c[i];
      valence += w;
  }
  sum /= valence;
  sum = pow(sum, vec3(1.0/2.2));

  // Apply hue shift to the final color
  sum = applyHueShift(sum, hueShift);

  // Apply saturation adjustment
  sum = applySaturation(sum, saturation);

  // Apply lightness adjustment
  sum = applyLightness(sum, lightness);

  return vec4(sum.xyz, 1.0);
}
`
