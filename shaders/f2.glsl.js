export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 q = fragCoord/iResolution.xy;
  vec2 p = -1.0 + 2.0*q;
  float t = iTime * timeScale;  // Use timeScale uniform

  // Dynamic linear gradient base with different rotation
  vec2 rotatedQ = q * rot(t * 0.15);  // Slightly different rotation speed
  vec3 baseColor = vec3(rotatedQ.x, 0.0, rotatedQ.y);  // Different color mapping
  baseColor = mix(baseColor, baseColor.yzx, sin(t * 0.4) * 0.3);  // Different color cycling

  // Two moving and pulsing radial gradients
  vec2 center1 = vec2(
      sin(t * 0.12) * 0.4,  // Slightly different movement range
      cos(t * 0.15) * 0.4
  );
  vec2 center2 = vec2(
      sin(t * 0.18) * 0.4,
      cos(t * 0.10) * 0.4
  );

  // Distance calculations for both centers
  float dist1 = length(p - center1);
  float dist2 = length(p - center2);

  // Dynamic sizes with different frequencies
  float radius1 = 1.6 +
      0.2 * sin(t * 0.25) +
      0.15 * cos(t * 0.4);
  float radius2 = 1.4 +
      0.25 * sin(t * 0.3) +
      0.2 * cos(t * 0.35);

  // Two sets of dynamic colors with different frequencies
  vec3 pulseColor1 = 0.5 + 0.2 * cos(vec3(t * 0.25, t * 0.35, t * 0.2));
  vec3 pulseColor2 = 0.5 + 0.2 * cos(vec3(t * 0.3, t * 0.4, t * 0.25));

  // Mix colors with different phases
  vec3 finalPulseColor1 = mix(pulseColor1, pulseColor2, sin(t * 0.2) * 0.5 + 0.5);
  vec3 finalPulseColor2 = mix(pulseColor2, pulseColor1, sin(t * 0.3) * 0.5 + 0.5);

  // Smoother falloffs for both pulses
  float falloff1 = smoothstep(radius1, 0.0, dist1) * 0.35;
  float falloff2 = smoothstep(radius2, 0.0, dist2) * 0.35;

  // Combine falloffs with minimum brightness
  falloff1 = max(falloff1, 0.1);
  falloff2 = max(falloff2, 0.1);

  // Blend the two pulses together
  vec3 col = mix(baseColor, finalPulseColor1, falloff1);
  col = mix(col, finalPulseColor2, falloff2);

  // Ensure minimum brightness and prevent blackouts
  col = max(col, vec3(0.1));

  return vec4(col, 1.0);
}
`
