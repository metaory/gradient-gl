export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 q = fragCoord / iResolution.xy;
  vec2 p = -1.0 + 2.0 * q;
  float t = iTime * timeScale; // Use timeScale uniform

  // Dynamic linear gradient base
  vec2 rotatedQ = q * rot(t * 0.2); // Slow rotation of the base gradient
  vec3 baseColor = vec3(0.0, rotatedQ).zxy;
  baseColor =
      mix(baseColor, baseColor.yzx, sin(t * 0.5) * 0.3); // Subtle color cycling

  // Moving and pulsing radial gradient
  vec2 center = vec2(sin(t * 0.15) * 0.5, // Increased movement range
                    cos(t * 0.12) * 0.5  // Increased movement range
  );

  // Proper distance calculation for circular shape
  float dist = length(p - center);

  // Larger dynamic size with multiple frequencies
  float radius = 1.8 + 0.3 * sin(t * 0.2) + // Increased size variation
                0.2 * cos(t * 0.5);        // Increased size variation

  // Three dynamic color sources with different frequencies
  vec3 pulseColor1 = 0.5 + 0.2 * cos(vec3(t * 0.3, t * 0.4, t * 0.25));
  vec3 pulseColor2 = 0.5 + 0.2 * cos(vec3(t * 0.25, t * 0.35, t * 0.2));
  vec3 pulseColor3 = 0.5 + 0.2 * cos(vec3(t * 0.35, t * 0.45, t * 0.3));

  // Mix colors with different phases to prevent blackouts
  vec3 pulseColor = mix(pulseColor1, pulseColor2, sin(t * 0.15) * 0.5 + 0.5);
  pulseColor = mix(pulseColor, pulseColor3, sin(t * 0.25) * 0.5 + 0.5);

  // Smoother falloff with dynamic edge and minimum brightness
  float falloff = smoothstep(radius, 0.0, dist) * 0.4; // Increased intensity
  falloff = max(falloff, 0.1); // Ensure minimum brightness

  // Combine effects with minimum brightness
  vec3 col = mix(baseColor, pulseColor, falloff);
  col = max(col, vec3(0.1)); // Prevent complete blackouts

  return vec4(col, 1.0);
}
`
