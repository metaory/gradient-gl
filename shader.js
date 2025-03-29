/**
 * WebGL fragment shader source for gradient effects
 * Contains multiple shader variations controlled by the currentShader uniform
 * Each shader uses common uniforms: iResolution, iTime, iFrame, currentShader, timeScale
 */

export default /* glsl */ `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec3 iResolution;
uniform float iTime;
uniform float iFrame;
uniform int currentShader; // Add uniform for shader selection
uniform float timeScale; // Add uniform for time scaling

// Common constants
#define POINTS 32
#define PI 3.1415926536
#define TAU (2.0 * PI)
#define S(a,b,t) smoothstep(a,b,t)

// Function declarations for variations
vec3 irri(float hue) {
    return 0.5 + 0.5 * cos((9.0 * hue) + vec3(0.0, 23.0, 21.0));
}

vec2 line(vec2 p, vec2 a, vec2 b) {
    vec2 ba = b - a;
    vec2 pa = p - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return vec2(length(pa - h * ba), h);
}

// Common utility functions
mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
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

// Noise functions for v_rare1
float wnoise(float ix, float iy) {
    ix = mod(ix, 10.);
    iy = mod(iy, 5.);
    return mod((600.+ix*iy*12453.+136.*pow(ix+15., mod(iy, 16.) )+
                sin(iy*1600.)*1376.+ix*656.+iy*75.), 1000.)/1000.;
}

float gnoise(float px, float py) {
    float mx = fract(px);
    float my = fract(py);
    px = floor(px);
    py = floor(py);
    return mix(
        mix(wnoise(px, py), wnoise(px+1., py), mx),
        mix(wnoise(px, py+1.), wnoise(px+1., py+1.), mx),
        my
    );
}

float fnoise(float px, float py) {
    float s = 0.;
    float a = .5;
    float f = 1.;
    for (int i=0; i<4; ++i) {
        s += a*gnoise(px*f, py*f);
        a *= .5;
        f *= 2.;
    }
    return s;
}

vec3 hash3d(vec3 p) {
    p = vec3(dot(p,vec3(127.1,311.7, 74.7)),
             dot(p,vec3(269.5,183.3,246.1)),
             dot(p,vec3(113.5,271.9,124.6)));
    p = -1.0 + 2.0*fract(sin(p)*43758.5453123);
    return p;
}

float noise3d(in vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f*f*(3.0-2.0*f);
    return mix(mix(mix(dot(hash3d(i + vec3(0.0,0.0,0.0)), f - vec3(0.0,0.0,0.0)),
                      dot(hash3d(i + vec3(1.0,0.0,0.0)), f - vec3(1.0,0.0,0.0)), u.x),
                 mix(dot(hash3d(i + vec3(0.0,1.0,0.0)), f - vec3(0.0,1.0,0.0)),
                     dot(hash3d(i + vec3(1.0,1.0,0.0)), f - vec3(1.0,1.0,0.0)), u.x), u.y),
            mix(mix(dot(hash3d(i + vec3(0.0,0.0,1.0)), f - vec3(0.0,0.0,1.0)),
                   dot(hash3d(i + vec3(1.0,0.0,1.0)), f - vec3(1.0,0.0,1.0)), u.x),
                mix(dot(hash3d(i + vec3(0.0,1.0,1.0)), f - vec3(0.0,1.0,1.0)),
                    dot(hash3d(i + vec3(1.0,1.0,1.0)), f - vec3(1.0,1.0,1.0)), u.x), u.y), u.z);
}


//  ░▒▓███████████████████▓ WARP ▓█████████████████████████████████▓▒░

// A dynamic gradient shader with rotating layers and color cycling
// Features smooth transitions between amber, blue, pink, and dark tones
// Uses noise for rotation and wave distortion effects
vec4 shader_warp1(vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float aspectRatio = iResolution.x / iResolution.y;
    vec2 tuv = uv - .5;
    float t = iTime * timeScale;  // Use timeScale uniform
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

// Layered noise shader with wave distortion
// Creates flowing patterns with sine wave displacement
// Uses 3D noise for organic movement
vec4 shader_warp2(vec2 fragCoord) {
    const int layers = 5;
    const float speed = 0.25;  // Base speed
    const float scale = 1.2;
    
    vec2 uv = (fragCoord-iResolution.xy-.5)/iResolution.y;
    float t = iTime * speed;  // Scaled time
    uv *= scale;
    float h = noise3d(vec3(uv*2., t));  // Time as z-coordinate for continuous noise
    for (int n = 1; n < layers; n++) {
        float i = float(n);
        uv -= vec2(0.7 / i * sin(i * uv.y + i + t * 2.0 + h * i) + 0.8,  // Reduced from 5.0 to 2.0
                  0.4 / i * sin(uv.x + 4. - i + h + t * 2.0 + 0.3 * i) + 1.6);  // Reduced from 5.0 to 2.0
    }
    uv -= vec2(1.2 * sin(uv.x + t + h) + 1.8,
              0.4 * sin(uv.y + t + 0.3*h) + 1.6);
    vec3 col = vec3(.5 * sin(uv.x) + 0.5,
                    .5 * sin(uv.x + uv.y) + 0.5,
                    .5 * sin(uv.y) + 0.8)*0.8;
    return vec4(col,1.0);
}

//  ░▒▓███████████████████▓ SOFT ▓█████████████████████████████████▓▒░

// A shader with 4 moving points creating a smooth color blend
// Uses inverse distance weighting for color interpolation
// Colors: red, yellow, cyan, and bright yellow
vec4 shader_soft1(vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 p[4];
    p[0] = vec2(0.1, 0.9);
    p[1] = vec2(0.9, 0.9);
    p[2] = vec2(0.5, 0.1);
    float t = iTime * timeScale;  // Use timeScale uniform
    p[3] = vec2(cos(t), sin(t)) * 0.4 + vec2(0.5, 0.5);
    vec3 c[4];
    // Add subtle color animation
    float colorShift = sin(t * 0.2) * 0.1;  // Slow color cycling
    c[0] = vec3(0.996078431372549 + colorShift, 0.3411764705882353, 0.33725490196078434);
    c[1] = vec3(0.996078431372549, 0.6352941176470588 + colorShift, 0.1607843137254902);
    c[2] = vec3(0.1450980392156863, 0.8196078431372549, 0.8588235294117647 + colorShift);
    c[3] = vec3(1.0, 1.0, 0.0);
    float blend = 2.0;
    vec3 sum = vec3(0.0);
    float valence = 0.0;
    for (int i = 0; i < 4; i++) {
        float distance = length(uv - p[i]);
        if (distance == 0.0) { distance = 1.0; }
        float w =  1.0 / pow(distance, blend);
        sum += w * c[i];
        valence += w;
    }
    sum /= valence;
    sum = pow(sum, vec3(1.0/2.2));
    return vec4(sum.xyz, 1.0);
}

// Gradient shader with rotation and wave distortion
// Yellow to deep blue to red to light blue transitions
// Uses noise for dynamic rotation angles
vec4 shader_soft2(vec2 fragCoord) {
    vec2 uv = fragCoord/iResolution.xy;
    float ratio = iResolution.x / iResolution.y;
    vec2 tuv = uv;
    tuv -= .5;
    float t = iTime * timeScale;  // Use timeScale uniform
    float degree = noise(vec2(t * 0.1, tuv.x*tuv.y));  // Slow rotation
    tuv.y *= 1./ratio;
    tuv *= rot(radians((degree-.5)*720.+180.));
    tuv.y *= ratio;
    float frequency = 5.;
    float amplitude = 30.;
    float speed = t * 1.0;  // Reduced from 2.0 to 1.0 for smoother waves
    tuv.x += sin(tuv.y*frequency+speed)/amplitude;
    tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);
    vec3 colorYellow = vec3(.957, .804, .623);
    vec3 colorDeepBlue = vec3(.192, .384, .933);
    vec3 layer1 = mix(colorYellow, colorDeepBlue, S(-.3, .2, (tuv*rot(radians(-5.))).x));
    vec3 colorRed = vec3(.910, .510, .8);
    vec3 colorBlue = vec3(0.350, .71, .953);
    vec3 layer2 = mix(colorRed, colorBlue, S(-.3, .2, (tuv*rot(radians(-5.))).x));
    vec3 finalComp = mix(layer1, layer2, S(.5, -.3, tuv.y));
    return vec4(finalComp, 1.0);
}

// Circular gradient with animated distortion
// Creates flowing patterns with pastel colors
// Uses sine waves for dynamic movement
vec4 shader_soft3(vec2 fragCoord) {
    vec2 uv = (fragCoord/iResolution.xy)*1.;
    uv.y -= 1.5;
    uv.x += .2;
    float t = iTime * timeScale;  // Use timeScale uniform
    vec2 p = uv;
    float t1 = t * 1.5;  // Reduced from 3.0 to 1.5
    float t2 = t * 0.5;  // Reduced from 1.0 to 0.5
    p.y *= (p.x*p.y) * sin(p.y*p.x + t1);  // Reduced frequency from 2. to 1.
    float d = length(p*.7);
    vec3 c0 = vec3(1.);
    vec3 c1 = vec3(.365, .794, .935);
    vec3 c2 = vec3(.973, .671, .961);
    vec3 c3 = vec3(.973, .843, .439);
    float offset = 1.2;
    float step1 = .05*offset + sin(t2*2.)*.1;  // Reduced from 3. to 2.
    float step2 = 0.3*offset + sin(t2)*.15;
    float step3 = 0.6*offset + sin(t2)*.1;
    float step4 = 1.2*offset + sin(t2*2.)*.2;  // Reduced from 3. to 2.
    vec3 col = mix(c0, c1, smoothstep(step1, step2, d));
    col = mix(col, c2, smoothstep(step2, step3, d));
    col = mix(col, c3, smoothstep(step3, step4, d));
    return vec4(col, .5);
}

// Multi-layered gradient with complex color mixing
// Features white, red, purple, green, blue, and yellow
// Uses rotation and wave distortion for dynamic effect
vec4 shader_soft4(vec2 fragCoord) {
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

// Complex point-based shader with 32 moving points
// Creates organic flowing patterns with rainbow colors
vec4 shader_soft5(vec2 fragCoord) {
    vec2 uv = fragCoord/iResolution.xy;
    float t = iTime * timeScale;  // Use timeScale uniform
    
    // Create smooth rotation based on noise
    float degree = noise(vec2(t * 0.1, uv.x*uv.y));  // Slow rotation
    vec2 tuv = uv * 2.0 - 1.0;  // Scale to [-1, 1] range
    tuv *= 1.5;  // Scale up to cover edges
    tuv *= rot(radians((degree-.5)*720.+180.));
    
    // Add wave distortion with adjusted scaling
    float frequency = 3.0;  // Reduced from 5.0 for smoother waves
    float amplitude = 40.0;  // Increased from 30.0 for more pronounced effect
    float speed = t * 0.8;  // Slower speed for more graceful movement
    tuv.x += sin(tuv.y*frequency+speed)/amplitude;
    tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);
    
    // Define a rich color palette
    vec3 color1 = vec3(0.957, 0.804, 0.623);  // Warm amber
    vec3 color2 = vec3(0.192, 0.384, 0.933);  // Deep blue
    vec3 color3 = vec3(0.910, 0.510, 0.800);  // Soft pink
    vec3 color4 = vec3(0.350, 0.710, 0.953);  // Light blue
    
    // Create layered gradients with smooth transitions
    vec3 layer1 = mix(color1, color2, S(-.3, .2, (tuv*rot(radians(-5.))).x));
    vec3 layer2 = mix(color3, color4, S(-.3, .2, (tuv*rot(radians(-5.))).x));
    
    // Blend layers with smooth vertical transition
    vec3 finalColor = mix(layer1, layer2, S(.5, -.3, tuv.y));
    
    // Add subtle color variation based on time
    float colorShift = sin(t * 0.3) * 0.1;
    finalColor = mix(finalColor, finalColor.yzx, colorShift);
    
    // Add subtle vignette with wider coverage
    float vignette = smoothstep(1.0, 0.0, length(uv - 0.5));
    finalColor *= vignette;
    
    return vec4(finalColor, 1.0);
}

//  ░▒▓███████████████████▓ FUSE ▓█████████████████████████████████▓▒░

// Simple diagonal gradient with time-based animation
// Creates a basic RGB pattern based on coordinates
// Uses sine wave for blue channel animation
vec4 shader_fuse1(vec2 fragCoord) {
    vec2 xy = vec2(0.0, 0.0);
    xy.x = fragCoord.x / iResolution.x;
    xy.y = fragCoord.y / iResolution.y;
    
    float t = iTime * timeScale;  // Use timeScale uniform
    
    // Enhanced color channel interaction
    float r = (xy.x + xy.y) * 0.5 + 0.2 * sin(t * 0.8);  // Added subtle red oscillation
    float g = 0.2 * sin(t * 1.2 + xy.x * 2.0);  // Added green channel with position-based phase
    float b = (xy.x - xy.y) * sin(t * 0.6);  // Scaled blue oscillation
    
    // Added color mixing for more interesting transitions
    vec3 col = vec3(r, g, b);
    col = mix(col, col.yzx, sin(t * 0.4) * 0.3);  // Subtle color channel rotation
    
    return vec4(col, 1.0);
}

// Enhanced radial gradient with dynamic linear base
// Creates a smooth circular pulse over animated linear gradient
vec4 shader_fuse2(vec2 fragCoord) {
    vec2 q = fragCoord/iResolution.xy;
    vec2 p = -1.0 + 2.0*q;
    float t = iTime * timeScale;  // Use timeScale uniform
    
    // Dynamic linear gradient base
    vec2 rotatedQ = q * rot(t * 0.2);  // Slow rotation of the base gradient
    vec3 baseColor = vec3(0.0, rotatedQ).zxy;
    baseColor = mix(baseColor, baseColor.yzx, sin(t * 0.5) * 0.3);  // Subtle color cycling
    
    // Moving and pulsing radial gradient
    vec2 center = vec2(
        sin(t * 0.15) * 0.5,  // Increased movement range
        cos(t * 0.12) * 0.5   // Increased movement range
    );
    
    // Proper distance calculation for circular shape
    float dist = length(p - center);
    
    // Larger dynamic size with multiple frequencies
    float radius = 1.8 + 
        0.3 * sin(t * 0.2) +    // Increased size variation
        0.2 * cos(t * 0.5);     // Increased size variation
    
    // Three dynamic color sources with different frequencies
    vec3 pulseColor1 = 0.5 + 0.2 * cos(vec3(t * 0.3, t * 0.4, t * 0.25));
    vec3 pulseColor2 = 0.5 + 0.2 * cos(vec3(t * 0.25, t * 0.35, t * 0.2));
    vec3 pulseColor3 = 0.5 + 0.2 * cos(vec3(t * 0.35, t * 0.45, t * 0.3));
    
    // Mix colors with different phases to prevent blackouts
    vec3 pulseColor = mix(pulseColor1, pulseColor2, sin(t * 0.15) * 0.5 + 0.5);
    pulseColor = mix(pulseColor, pulseColor3, sin(t * 0.25) * 0.5 + 0.5);
    
    // Smoother falloff with dynamic edge and minimum brightness
    float falloff = smoothstep(radius, 0.0, dist) * 0.4;  // Increased intensity
    falloff = max(falloff, 0.1);  // Ensure minimum brightness
    
    // Combine effects with minimum brightness
    vec3 col = mix(baseColor, pulseColor, falloff);
    col = max(col, vec3(0.1));  // Prevent complete blackouts
    
    return vec4(col, 1.0);
}

// Dual radial gradient with dynamic linear base
// Creates two interacting circular pulses over animated linear gradient
vec4 shader_fuse3(vec2 fragCoord) {
    vec2 q = fragCoord/iResolution.xy;
    vec2 p = -1.0 + 2.0*q;
    float t = iTime * timeScale;  // Use timeScale uniform
    
    // Dynamic linear gradient base with different rotation
    vec2 rotatedQ = q * rot(t * 0.15);  // Slightly different rotation speed
    vec3 baseColor = vec3(rotatedQ.x, 0.0, rotatedQ.y);  // Different color mapping
    baseColor = mix(baseColor, baseColor.yzx, sin(t * 0.4) * 0.3);  // Different color cycling
    
    // Two moving and pulsing radial gradients
    vec2 center1 = vec2(
        sin(t * 0.12) * 0.4,  // Slightly different movement range
        cos(t * 0.15) * 0.4
    );
    vec2 center2 = vec2(
        sin(t * 0.18) * 0.4,
        cos(t * 0.10) * 0.4
    );
    
    // Distance calculations for both centers
    float dist1 = length(p - center1);
    float dist2 = length(p - center2);
    
    // Dynamic sizes with different frequencies
    float radius1 = 1.6 + 
        0.2 * sin(t * 0.25) +
        0.15 * cos(t * 0.4);
    float radius2 = 1.4 + 
        0.25 * sin(t * 0.3) +
        0.2 * cos(t * 0.35);
    
    // Two sets of dynamic colors with different frequencies
    vec3 pulseColor1 = 0.5 + 0.2 * cos(vec3(t * 0.25, t * 0.35, t * 0.2));
    vec3 pulseColor2 = 0.5 + 0.2 * cos(vec3(t * 0.3, t * 0.4, t * 0.25));
    
    // Mix colors with different phases
    vec3 finalPulseColor1 = mix(pulseColor1, pulseColor2, sin(t * 0.2) * 0.5 + 0.5);
    vec3 finalPulseColor2 = mix(pulseColor2, pulseColor1, sin(t * 0.3) * 0.5 + 0.5);
    
    // Smoother falloffs for both pulses
    float falloff1 = smoothstep(radius1, 0.0, dist1) * 0.35;
    float falloff2 = smoothstep(radius2, 0.0, dist2) * 0.35;
    
    // Combine falloffs with minimum brightness
    falloff1 = max(falloff1, 0.1);
    falloff2 = max(falloff2, 0.1);
    
    // Blend the two pulses together
    vec3 col = mix(baseColor, finalPulseColor1, falloff1);
    col = mix(col, finalPulseColor2, falloff2);
    
    // Ensure minimum brightness and prevent blackouts
    col = max(col, vec3(0.1));
    
    return vec4(col, 1.0);
}

//  ░▒▓███████████████████▓ NEON ▓█████████████████████████████████▓▒░

// Line-based shader with color interpolation
// Creates parallel animated lines with rainbow colors
// Uses custom color function for smooth transitions
vec4 shader_neon1(vec2 fragCoord) {
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

// 4 moving points with RGB + yellow color scheme
// Uses inverse distance weighting for smooth transitions
vec4 shader_neon2(vec2 fragCoord) {
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

//  ░▒▓███████████████████▓ FLOW ▓█████████████████████████████████▓▒░

// A noise-based shader with dynamic color transitions
// Creates a flowing effect with blue to white gradient
// Uses custom noise functions for the pattern generation
vec4 shader_flow1(vec2 fragCoord) {
    vec2 uv = fragCoord/iResolution.xy;
    float t = iTime * timeScale;  // Use timeScale uniform
    
    // Proper aspect ratio correction
    float px = (uv.x-.5)*iResolution.x/iResolution.y+.5;
    float py = 1.-uv.y;
    
    // Time-based animation instead of frame-based
    float timeOffset = t * 0.3;  // Slower time-based movement
    
    // Enhanced noise pattern with time-based movement
    float fi = .1/((fnoise(px*9., py*9.+timeOffset*5.)*( 
        .03+0.*length(vec2(px-.5, py/2.-.5))*.15+
        0.1/(pow(py, 1.1)+0.1)
    )))-0.5;
    
    // Smoother color transitions with time-based interpolation
    vec3 col;
    if (fi <= 0.) {
        col = vec3(0., 0., 100./255.);
    }
    else if (0. < fi && fi < .7) {
        float t = fi/.7;
        col = vec3(0., t, 100./255.+155./255.*t);
    }
    else {
        col = vec3(1.);
    }
    
    // Add subtle time-based color variation
    float colorShift = sin(t * 0.2) * 0.1;
    col = mix(col, col.yzx, colorShift);
    
    return vec4(col, 1.0);
}

//  ░▒▓███████████████████▓ MAIN ▓█████████████████████████████████▓▒░

// Main function to switch between shaders
void main() {
    // Switch between shaders based on uniform value
    switch(currentShader) {
        case 0: fragColor = shader_warp1(gl_FragCoord.xy); break;
        case 1: fragColor = shader_warp2(gl_FragCoord.xy); break;

        case 2: fragColor = shader_soft1(gl_FragCoord.xy); break;
        case 3: fragColor = shader_soft2(gl_FragCoord.xy); break;
        case 4: fragColor = shader_soft3(gl_FragCoord.xy); break;
        case 5: fragColor = shader_soft4(gl_FragCoord.xy); break;
        case 6: fragColor = shader_soft5(gl_FragCoord.xy); break;

        case 7: fragColor = shader_fuse1(gl_FragCoord.xy); break;
        case 8: fragColor = shader_fuse2(gl_FragCoord.xy); break;
        case 9: fragColor = shader_fuse3(gl_FragCoord.xy); break;

        case 10: fragColor = shader_neon1(gl_FragCoord.xy); break;
        case 11: fragColor = shader_neon2(gl_FragCoord.xy); break;

        case 12: fragColor = shader_flow1(gl_FragCoord.xy); break;
    }
}`