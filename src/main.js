const vs = `#version 300 es
in vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}`;

// Load fragment shader
const fs = await fetch('/src/unified.frag').then(r => r.text());

// Create WebGL context
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');

// Create and compile shaders
const program = gl.createProgram();
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vertexShader, vs);
gl.shaderSource(fragmentShader, fs);
gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);

// Check shader compilation
const checkShaderCompilation = (shader, type) => {
    const log = gl.getShaderInfoLog(shader);
    if (log) console.error(`${type} shader compilation error:`, log);
    return !log;
};

const vertexOk = checkShaderCompilation(vertexShader, 'Vertex');
const fragmentOk = checkShaderCompilation(fragmentShader, 'Fragment');

if (!vertexOk || !fragmentOk) {
    throw new Error('Shader compilation failed');
}

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// Check program linking
const programLog = gl.getProgramInfoLog(program);
if (programLog) console.error('Program linking error:', programLog);

// Set up vertex buffer
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

// Get attribute and uniform locations
const positionLocation = gl.getAttribLocation(program, 'position');
const iResolutionLocation = gl.getUniformLocation(program, 'iResolution');
const iTimeLocation = gl.getUniformLocation(program, 'iTime');
const iFrameLocation = gl.getUniformLocation(program, 'iFrame');
const currentShaderLocation = gl.getUniformLocation(program, 'currentShader');
const timeScaleLocation = gl.getUniformLocation(program, 'timeScale');

// Set up vertex attributes
gl.useProgram(program);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// const selectedShader = Math.floor(Math.random() * 12);
const selectedShader = 0;
console.log('Selected shader variation:', selectedShader);

// Animation loop
const startTime = performance.now();
const TIME_SCALE = 0.9; // Control overall animation speed

// One-time uniform setup (outside render loop)
const setupUniforms = () => {
    gl.uniform1i(currentShaderLocation, selectedShader);
    gl.uniform1f(timeScaleLocation, TIME_SCALE);
}

// Update canvas size and viewport
const updateCanvasSize = () => {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.uniform3f(iResolutionLocation, canvas.width, canvas.height, 1.0);
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}

// Only dynamic values in render loop
const render = () => {
    updateCanvasSize();
    
    // Only truly dynamic values per frame
    const currentTime = ((performance.now() - startTime) / 1000) * TIME_SCALE;
    gl.uniform1f(iTimeLocation, currentTime);
    gl.uniform1f(iFrameLocation, Math.floor(currentTime * 60));
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}

setupUniforms();
render(); 