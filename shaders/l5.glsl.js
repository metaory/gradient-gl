export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  float t = iTime * timeScale * 0.7;
  vec2 uv = fragCoord / iResolution.xy;
  float ar = iResolution.x / iResolution.y;
  
  vec2 p = (uv - 0.5) * vec2(ar, 1.0);

  float n1 = noise(p * 3.0 + t * 0.3);
  float n2 = noise(p * 2.5 - t * 0.25 + 5.0);
  float n3 = noise(p * 2.0 + t * 0.2 + 10.0);

  vec2 mesh = p;
  mesh.x += sin(p.y * 4.0 + t * 0.8 + n1 * 2.0) * 0.15;
  mesh.y += cos(p.x * 3.5 - t * 0.7 + n2 * 2.0) * 0.12;
  mesh.x += sin(mesh.y * 3.0 + t * 0.5) * 0.1;
  mesh.y += cos(mesh.x * 2.5 + t * 0.6) * 0.08;

  float pattern1 = sin(mesh.x * 4.0 + t * 0.4) * cos(mesh.y * 3.5 - t * 0.35);
  float pattern2 = sin((mesh.x + mesh.y) * 2.5 + t * 0.5) * cos((mesh.x - mesh.y) * 2.0 - t * 0.4);
  float pattern3 = sin(length(mesh) * 4.0 - t * 0.6) * 0.5 + 0.5;

  float blend1 = pattern1 * 0.4 + 0.5 + n1 * 0.4;
  float blend2 = pattern2 * 0.4 + 0.5 + n2 * 0.4;
  float blend3 = pattern3 + n3 * 0.3;

  vec3 c1 = vec3(0.65, 0.2, 0.82);
  vec3 c2 = vec3(0.95, 0.5, 0.35);
  vec3 c3 = vec3(0.4, 0.8, 0.9);
  vec3 c4 = vec3(0.9, 0.3, 0.55);

  vec3 col = mix(c1, c2, smoothstep(0.15, 0.85, blend1));
  col = mix(col, c3, smoothstep(0.2, 0.8, blend2));
  col = mix(col, c4, smoothstep(0.25, 0.8, blend3) * 0.45);

  col = mix(col, col.yzx, n1 * n2 * 0.4);

  col = pow(col, vec3(0.9)) * 1.05;

  col = applyHueShift(col, hueShift);
  col = applySaturation(col, saturation);
  col = applyLightness(col, lightness);

  return vec4(col, 1.0);
}
`
