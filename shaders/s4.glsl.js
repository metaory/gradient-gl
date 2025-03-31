export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord/iResolution.xy;
  float ratio = iResolution.x / iResolution.y;
  vec2 tuv = uv;
  tuv -= .5;
  float t = iTime * timeScale;  // Use timeScale uniform
  float degree = noise(vec2(t * 0.1, tuv.x*tuv.y));  // Slow rotation
  tuv.y *= 1./ratio;
  tuv *= rot(radians((degree-.5)*720.+75.));
  tuv.y *= ratio;
  float frequency = 2.;
  float amplitude = 30.;
  float speed = t * 1.0;  // Reduced from 4.0 to 1.0 for smoother waves
  tuv.x += sin(tuv.y*frequency+speed)/amplitude;
  tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);
  vec3 colorWhite = vec3(1.0, 1.0, 1.0);
  vec3 colorRed = vec3(.914, .345, .62);
  vec3 colorPurple = vec3(.792, .573, .871);
  vec3 colorGreen = vec3(.612, .91, .364);
  vec3 colorBlue = vec3(.42, .773, .937);
  vec3 colorYellow = vec3(1.0, .973, .325);
  vec3 layer1 = mix(colorRed, colorYellow, S(-.6, .2, (tuv*rot(radians(-5.))).x));
  layer1 = mix(layer1, colorWhite, S(-.6, .2, (tuv*rot(radians(-5.))).x));
  layer1 = mix(layer1, colorPurple, S(-.2, .6, (tuv*rot(radians(-5.))).x));
  vec3 layer2 = mix(colorRed, colorYellow, S(-.8, .2, (tuv*rot(radians(-5.))).x));
  layer2 = mix(layer2, colorGreen, S(-.1, .9, (tuv*rot(radians(-5.))).x));
  layer2 = mix(layer2, colorBlue, S(-.5, .5, (tuv*rot(radians(-5.))).x));
  vec3 finalComp = mix(layer1, layer2, S(.7, -.5, tuv.y));
  return vec4(finalComp, 1.0);
}
`
