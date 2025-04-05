export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord/iResolution.xy;
  float t = iTime * timeScale;

  // Create smooth rotation based on noise
  float degree = noise(vec2(t * 0.1, uv.x*uv.y));
  vec2 tuv = uv * 2.0 - 1.0;
  tuv *= 1.5;
  tuv *= rot(radians((degree-.5)*720.+180.));

  // Add wave distortion with adjusted scaling
  float frequency = 3.0;
  float amplitude = 40.0;
  float speed = t * 0.8;
  tuv.x += sin(tuv.y*frequency+speed)/amplitude;
  tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);

  // Define a rich color palette
  vec3 color1 = vec3(0.957, 0.804, 0.623);
  vec3 color2 = vec3(0.192, 0.384, 0.933);
  vec3 color3 = vec3(0.910, 0.510, 0.800);
  vec3 color4 = vec3(0.350, 0.710, 0.953);

  // Create layered gradients with smooth transitions
  vec3 layer1 = mix(color1, color2, S(-.3, .2, (tuv*rot(radians(-5.))).x));
  vec3 layer2 = mix(color3, color4, S(-.3, .2, (tuv*rot(radians(-5.))).x));

  // Blend layers with smooth vertical transition
  vec3 finalColor = mix(layer1, layer2, S(.5, -.3, tuv.y));

  // Add subtle color variation based on time
  float colorShift = sin(t * 0.3) * 0.1;
  finalColor = mix(finalColor, finalColor.yzx, colorShift);

  // Add subtle vignette with wider coverage
  float vignette = smoothstep(1.0, 0.0, length(uv - 0.5));
  finalColor *= vignette;

  // Apply color adjustments
  finalColor = applyHueShift(finalColor, hueShift);
  finalColor = applySaturation(finalColor, saturation);
  finalColor = applyLightness(finalColor, lightness);

  return vec4(finalColor, 1.0);
}
`
