export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 xy = vec2(0.0, 0.0);
  xy.x = fragCoord.x / iResolution.x;
  xy.y = fragCoord.y / iResolution.y;

  float t = iTime * timeScale;  // Use timeScale uniform

  // Enhanced color channel interaction
  float r = (xy.x + xy.y) * 0.5 + 0.2 * sin(t * 0.8);  // Added subtle red oscillation
  float g = 0.2 * sin(t * 1.2 + xy.x * 2.0);  // Added green channel with position-based phase
  float b = (xy.x - xy.y) * sin(t * 0.6);  // Scaled blue oscillation

  // Added color mixing for more interesting transitions
  vec3 col = vec3(r, g, b);
  col = mix(col, col.yzx, sin(t * 0.4) * 0.3);  // Subtle color channel rotation

  return vec4(col, 1.0);
}
`
