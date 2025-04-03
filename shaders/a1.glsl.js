export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  float aspectRatio = iResolution.x / iResolution.y;
  vec2 tuv = uv - .5;
  float t = iTime * 0.5;  // Use fixed speed instead of timeScale
  float degree = noise(vec2(t * 0.1, tuv.x*tuv.y));  // Slow rotation
  tuv.y *= 1./aspectRatio;
  tuv *= rot(radians((degree-.5)*720.+180.));
  tuv.y *= aspectRatio;
  float frequency = 5.;
  float amplitude = 30.;
  float speed = t * 2.0;  // Reduced from 4.0 to 2.0 for smoother waves
  tuv.x += sin(tuv.y*frequency+speed)/amplitude;
  tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);
  vec3 amberYellow = vec3(299, 186, 137) / vec3(255);
  vec3 deepBlue = vec3(49, 98, 238) / vec3(255);
  vec3 pink = vec3(246, 146, 146) / vec3(255);
  vec3 blue = vec3(89, 181, 243) / vec3(255);
  vec3 purpleHaze = vec3(105, 49, 245) / vec3(255);
  vec3 swampyBlack = vec3(32, 42, 50) / vec3(255);
  vec3 persimmonOrange = vec3(233, 51, 52) / vec3(255);
  vec3 darkAmber = vec3(233, 160, 75) / vec3(255);
  float cycle = sin(t * 0.5);  // Slower color cycling
  float mixT = (sign(cycle) * pow(abs(cycle), 0.6) + 1.) / 2.;
  vec3 color1 = mix(amberYellow, purpleHaze, mixT);
  vec3 color2 = mix(deepBlue, swampyBlack, mixT);
  vec3 color3 = mix(pink, persimmonOrange, mixT);
  vec3 color4 = mix(blue, darkAmber, mixT);
  vec3 layer1 = mix(color3, color2, smoothstep(-.3, .2, (tuv*rot(radians(-5.))).x));
  vec3 layer2 = mix(color4, color1, smoothstep(-.3, .2, (tuv*rot(radians(-5.))).x));
  vec3 color = mix(layer1, layer2, smoothstep(.5, -.3, tuv.y));
  return vec4(color, 1.0);
}
`
