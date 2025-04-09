export default /* glsl */ `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec3 iResolution;
uniform float iTime;
uniform float iFrame;
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
`
