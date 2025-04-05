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
    vec2 uv = fragCoord / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y;
    float t = iTime * timeScale;

    // Create noise-based gradient with aspect ratio correction
    vec2 p = uv * 0.5;
    p.x *= aspectRatio;
    float noise1 = noise(p + t * 0.05);
    float noise2 = noise(p * 0.5 - t * 0.08);

    // Create gradient with noise influence
    vec3 color = vec3(
        noise1 * 0.8 + 0.2,
        noise2 * 0.8 + 0.2,
        (noise1 + noise2) * 0.4 + 0.3
    );

    // Add some rotation-based variation
    vec2 rotatedUV = uv * rot(t * 0.02);
    rotatedUV.x *= aspectRatio;
    float rotationNoise = noise(rotatedUV * 0.5);
    color = mix(color, color.yzx, rotationNoise * 0.2);

    // Apply color adjustments
    color = applyHueShift(color, hueShift);
    color = applySaturation(color, saturation);
    color = applyLightness(color, lightness);

    return vec4(color, 1.0);
}
`
