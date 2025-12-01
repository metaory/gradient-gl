export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord/iResolution.xy;
  float t = iTime * timeScale;

  float n1 = noise(uv * 2.0 + t * 0.3);
  float n2 = noise(uv * 1.5 - t * 0.25 + 5.0);

  float degree = noise(vec2(t * 0.2, uv.x * uv.y * 0.4 + n1 * 0.2));
  vec2 tuv = uv * 2.0 - 1.0;
  tuv += vec2(n1 - 0.5, n2 - 0.5) * 0.15;
  tuv *= 1.1;
  tuv *= rot(radians((degree - 0.5) * 140.0 + 70.0));

  float frequency = 2.0;
  float amplitude = 20.0;
  float speed = t * 1.2;
  tuv.x += sin(tuv.y * frequency + speed + n1 * 0.5) / amplitude;
  tuv.y += sin(tuv.x * frequency * 1.1 + speed * 0.7 + n2 * 0.5) / (amplitude * 0.7);

  vec3 color1 = vec3(0.95, 0.8, 0.62);
  vec3 color2 = vec3(0.2, 0.4, 0.9);
  vec3 color3 = vec3(0.9, 0.5, 0.8);
  vec3 color4 = vec3(0.35, 0.7, 0.95);

  float bx = (tuv * rot(radians(-5.))).x + (n1 - 0.5) * 0.2;
  float by = tuv.y + (n2 - 0.5) * 0.2;

  vec3 layer1 = mix(color1, color2, S(-.5, .4, bx));
  vec3 layer2 = mix(color3, color4, S(-.5, .4, bx));

  vec3 finalColor = mix(layer1, layer2, S(.6, -.4, by));

  finalColor = mix(finalColor, finalColor.yzx, n1 * 0.15);
  finalColor = mix(finalColor, finalColor.zxy, n2 * 0.1);

  float vignette = smoothstep(1.4, 0.3, length(uv - 0.5));
  finalColor *= vignette;

  finalColor = applyHueShift(finalColor, hueShift);
  finalColor = applySaturation(finalColor, saturation);
  finalColor = applyLightness(finalColor, lightness);

  return vec4(finalColor, 1.0);
}
`
