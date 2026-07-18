export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = (fragCoord/iResolution.xy)*1.;
  uv.y -= 1.5;
  uv.x += .2;
  float t = iTime * timeScale;
  vec2 p = uv;
  float t1 = t * 1.5;
  float t2 = t * 0.5;
  p.y *= (p.x*p.y) * sin(p.y*p.x + t1);
  float d = length(p*.7);
  vec3 c0 = vec3(1.);
  vec3 c1 = vec3(.365, .794, .935);
  vec3 c2 = vec3(.973, .671, .961);
  vec3 c3 = vec3(.973, .843, .439);
  float offset = 1.2;
  float step1 = .05*offset + sin(t2*2.)*.1;
  float step2 = 0.3*offset + sin(t2)*.15;
  float step3 = 0.6*offset + sin(t2)*.1;
  float step4 = 1.2*offset + sin(t2*2.)*.2;
  vec3 col = mix(c0, c1, smoothstep(step1, step2, d));
  col = mix(col, c2, smoothstep(step2, step3, d));
  col = mix(col, c3, smoothstep(step3, step4, d));

  return vec4(finalColor(col), 1.0);
}
`
