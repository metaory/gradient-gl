export default /* glsl */ `
vec3 irri(float hue) {
    return 0.5 + 0.5 * cos((9.0 * hue) + vec3(0.0, 23.0, 21.0));
}

vec2 line(vec2 p, vec2 a, vec2 b) {
    vec2 ba = b - a;
    vec2 pa = p - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return vec2(length(pa - h * ba), h);
}

vec4 shader(vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec3 sum = vec3(0.0);
    float valence = 0.0;
    float t = iTime * timeScale;  // Use timeScale uniform
    for (float i = 0.0; i <= 4.0; i++) {
        float id = 0.2 + (i/5.0) * 0.75;
        vec2 start = vec2(id, 0.25);
        vec2 end = vec2(id, 0.75);
        float blend = 2.0;
        vec2 d = line(uv, start, end);
        float w = 1.0 / pow(d.x, blend);
        vec3 colA = irri(id + t * 0.2);  // Adjusted to match our time scaling
        sum += w * colA;
        valence += w;
    }
    sum /= valence;
    sum = pow(sum, vec3(1.0/2.2));
    return vec4(sum, 1.0);
}
`
