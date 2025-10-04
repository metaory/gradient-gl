export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord/iResolution.xy;
  float ratio = iResolution.x / iResolution.y;
  vec2 tuv = uv;
  tuv -= .5;
  float t = iTime * timeScale;
  float degree = noise(vec2(t * 0.1, tuv.x*tuv.y));
  tuv.y *= 1./ratio;
  tuv *= rot(radians((degree-.5)*720.+180.));
  tuv.y *= ratio;
  float frequency = 5.;
  float amplitude = 30.;
  float speed = t * 1.0;
  tuv.x += sin(tuv.y*frequency+speed)/amplitude;
  tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);
  vec3 colorYellow = vec3(.957, .804, .623);
  vec3 colorDeepBlue = vec3(.192, .384, .933);
  vec3 layer1 = mix(colorYellow, colorDeepBlue, S(-.3, .2, (tuv*rot(radians(-5.))).x));
  vec3 colorRed = vec3(.910, .510, .8);
  vec3 colorBlue = vec3(0.350, .71, .953);
  vec3 layer2 = mix(colorRed, colorBlue, S(-.3, .2, (tuv*rot(radians(-5.))).x));
  vec3 finalComp = mix(layer1, layer2, S(.5, -.3, tuv.y));

  finalComp = applyHueShift(finalComp, hueShift);
  finalComp = applySaturation(finalComp, saturation);
  finalComp = applyLightness(finalComp, lightness);

  return vec4(finalComp, 1.0);
}
`
