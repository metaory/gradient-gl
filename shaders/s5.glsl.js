export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord/iResolution.xy;
  float t = iTime * timeScale;  // Use timeScale uniform

  // Create smooth rotation based on noise
  float degree = noise(vec2(t * 0.1, uv.x*uv.y));  // Slow rotation
  vec2 tuv = uv * 2.0 - 1.0;  // Scale to [-1, 1] range
  tuv *= 1.5;  // Scale up to cover edges
  tuv *= rot(radians((degree-.5)*720.+180.));

  // Add wave distortion with adjusted scaling
  float frequency = 3.0;  // Reduced from 5.0 for smoother waves
  float amplitude = 40.0;  // Increased from 30.0 for more pronounced effect
  float speed = t * 0.8;  // Slower speed for more graceful movement
  tuv.x += sin(tuv.y*frequency+speed)/amplitude;
  tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);

  // Define a rich color palette
  vec3 color1 = vec3(0.957, 0.804, 0.623);  // Warm amber
  vec3 color2 = vec3(0.192, 0.384, 0.933);  // Deep blue
  vec3 color3 = vec3(0.910, 0.510, 0.800);  // Soft pink
  vec3 color4 = vec3(0.350, 0.710, 0.953);  // Light blue

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

  return vec4(finalColor, 1.0);
}
`
