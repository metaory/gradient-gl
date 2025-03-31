export default /* glsl */ `
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

vec4 shader(vec2 fragCoord) {
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
`;
