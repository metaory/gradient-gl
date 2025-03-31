export default /* glsl */ `
vec4 shader(vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 p[4];
    p[0] = vec2(0.1, 0.9);
    p[1] = vec2(0.9, 0.9);
    p[2] = vec2(0.5, 0.1);
    float t = iTime * timeScale;  // Use timeScale uniform
    float angle = t * 1.5;  // Increased from 0.5 to 1.5 for more movement
    float radius = 0.4 * (0.8 + 0.2 * sin(t * 0.5));  // Increased from 0.2 to 0.5 for more noticeable pulsing
    p[3] = vec2(cos(angle), sin(angle)) * radius + vec2(0.5, 0.5);
    vec3 c[4];
    // Add subtle color animation
    float colorShift = sin(t * 0.3) * 0.1;  // Increased from 0.2 to 0.3 for more color variation
    c[0] = vec3(1.0 + colorShift, 0.0, 0.0);
    c[1] = vec3(0.0, 1.0 + colorShift, 0.0);
    c[2] = vec3(0.0, 0.0, 1.0 + colorShift);
    c[3] = vec3(1.0, 1.0, 0.0);
    vec3 sum = vec3(0.0);
    float valence = 0.0;
    for (int i = 0; i < 4; i++) {
        float distance = length(uv - p[i]);
        if (distance == 0.0) { distance = 1.0; }
        float w =  1.0 / pow(distance, 2.0);
        sum += w * c[i];
        valence += w;
    }
    sum /= valence;
    sum = pow(sum, vec3(1.0/2.2));
    return vec4(sum.xyz, 1.0);
}
`
