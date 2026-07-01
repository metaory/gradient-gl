export default /* glsl */ `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec3 iResolution;
uniform float iTime;
uniform float timeScale;
uniform float hueShift;
uniform float saturation;
uniform float lightness;

#define POINTS 32
#define PI 3.1415926536
#define TAU (2.0 * PI)
#define S(a,b,t) smoothstep(a,b,t)

mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

// HSV to RGB conversion
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// RGB to HSV conversion
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// Apply hue shift to RGB color
vec3 applyHueShift(vec3 color, float shift) {
    vec3 hsv = rgb2hsv(color);
    hsv.x = fract(hsv.x + shift); // Rotate hue by shift amount (0-1 range)
    return hsv2rgb(hsv);
}

// Apply saturation adjustment to RGB color
vec3 applySaturation(vec3 color, float satFactor) {
    vec3 hsv = rgb2hsv(color);
    hsv.y = clamp(hsv.y * satFactor, 0.0, 1.0); // Adjust saturation
    return hsv2rgb(hsv);
}

// Add dithering function
float dither(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
}

// Apply lightness adjustment to RGB color
vec3 applyLightness(vec3 color, float lightFactor) {
    // Convert to grayscale for more dramatic effect
    float gray = dot(color, vec3(0.299, 0.587, 0.114));

    // Shift the curve to make 0 match previous 1
    float shiftedFactor = (lightFactor * 14.0 + 1.0) / 15.0;
    float curve = shiftedFactor * shiftedFactor * 0.9;

    // Mix between original color and white/black based on lightness
    vec3 result;
    if (lightFactor > 0.5) {
        // Mix with white for lighter values, but cap at 0.95
        float mixAmount = min((curve - 0.5) * 2.0, 0.95);
        result = mix(color, vec3(1.0), mixAmount);
    } else {
        // Mix with black for darker values, but cap at 0.95
        float mixAmount = min(curve * 2.0, 0.95);
        result = mix(vec3(0.1), color, mixAmount);
    }

    // Add dithering to break up color bands
    float ditherAmount = (1.0 - lightFactor) * 0.02; // More dither in darker areas
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float noise = dither(uv) * ditherAmount;
    result += vec3(noise);

    return result;
}

vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37)));
    return fract(sin(p)*43758.5453);
}

float noise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    float n = mix(mix(dot(-1.0+2.0*hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
    dot(-1.0+2.0*hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(-1.0+2.0*hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
    dot(-1.0+2.0*hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
    return 0.5 + 0.5*n;
}
// Unified palette function
vec3 palette(float t, vec3 d) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(1.0, 0.9, 0.8);
    vec3 c = vec3(1.0, 1.0, 1.0);
    return a + b * cos(TAU * (c * t + d));
}

// Unified smooth noise function with configurable smoothness
float smoothNoise(vec2 p, float smoothness) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (smoothness - (smoothness - 1.0) * f);
    float a = dot(hash(i), f);
    float b = dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
    float c = dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
    float d = dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
    return 0.5 + 0.5 * mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Get normalized UV with aspect ratio
vec2 getUV(vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float ar = iResolution.x / iResolution.y;
    return (uv - 0.5) * vec2(ar, 1.0);
}

// Apply gamma correction
vec3 applyGamma(vec3 col) {
    return pow(col, vec3(0.7)) * 1.2;
}

// Apply post-processing chain (hue, saturation, lightness)
vec3 applyPostProcessing(vec3 col) {
    col = applyHueShift(col, hueShift);
    col = applySaturation(col, saturation);
    col = applyLightness(col, lightness);
    return col;
}

// Unified channel swapping
vec3 channelSwap(vec3 col, float amount) {
    col = mix(col, col.yzx, amount);
    col = mix(col, col.zxy, amount * 0.67);
    return col;
}

// Unified FBM with configurable octaves
float fbm(vec2 p, float t, int octaves) {
    float f = 0.0;
    float amp = 0.5;
    mat2 m = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < octaves; i++) {
        f += amp * noise(p + t * 0.2);
        p = m * p * 2.0;
        amp *= 0.5;
    }
    return f;
}

// Unified swirl function
vec2 swirl(vec2 uv, float seed, float t) {
    float n = fract(sin(seed * 127.1) * 43758.5453);
    vec2 center = vec2(cos(t * 0.4 + n * TAU), sin(t * 0.5 + n * PI)) * 0.35;
    vec2 d = uv - center;
    float dist = length(d);
    float strength = exp(-dist * 2.5) * (0.5 + 0.5 * cos(dist * 6.0));
    float angle = strength * sin(t * 0.5 + n * TAU) * 3.5;
    return center + d * rot(angle);
}

// Final output helper (gamma + clamp + post-processing)
vec3 finalColor(vec3 col) {
    col = applyGamma(col);
    col = clamp(col, 0.0, 1.0);
    return applyPostProcessing(col);
}

// Dot noise for subtle grain effect
float dotNoise(vec2 uv, float amount) {
    return (dither(uv) - 0.5) * amount;
}

#define aspectRatio (iResolution.x / iResolution.y)
`
