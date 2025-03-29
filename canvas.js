const vertexShaderSource = `#version 300 es
    in vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }`;

import fragmentShaderSource from './shader.js';

export default (canvas, shaderId, shaderOpts) => {
	// Create WebGL context
	const gl = canvas.getContext("webgl2");

	// Create and compile shaders
	const program = gl.createProgram();
	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderSource);
	gl.shaderSource(fragmentShader, fragmentShaderSource);
	gl.compileShader(vertexShader);
	gl.compileShader(fragmentShader);

	// Check shader compilation
	const vertexLog = gl.getShaderInfoLog(vertexShader);
	const fragmentLog = gl.getShaderInfoLog(fragmentShader);
	if (vertexLog || fragmentLog) {
		if (vertexLog) console.error("Vertex shader compilation error:", vertexLog);
		if (fragmentLog) console.error("Fragment shader compilation error:", fragmentLog);
		throw new Error("Shader compilation failed");
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	// Check program linking
	if (gl.getProgramInfoLog(program)) {
		console.error("Program linking error:", gl.getProgramInfoLog(program));
	}

	// Set up vertex buffer
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
		gl.STATIC_DRAW,
	);

	// Get attribute and uniform locations
	const positionLocation = gl.getAttribLocation(program, "position");
	const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
	const iTimeLocation = gl.getUniformLocation(program, "iTime");
	const iFrameLocation = gl.getUniformLocation(program, "iFrame");
	const currentShaderLocation = gl.getUniformLocation(program, "currentShader");
	const timeScaleLocation = gl.getUniformLocation(program, "timeScale");
	const shaderOptsLocation = gl.getUniformLocation(program, "shaderOpts");

	// Set up vertex attributes
	gl.useProgram(program);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	// Set static uniforms
	gl.uniform1i(currentShaderLocation, shaderId);
	gl.uniform3f(shaderOptsLocation, ...shaderOpts);
	gl.uniform1f(timeScaleLocation, 0.9);

	// Animation loop
	const startTime = performance.now();

	const updateCanvasSize = () => {
		const displayWidth = canvas.clientWidth;
		const displayHeight = canvas.clientHeight;
		if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
			canvas.width = displayWidth;
			canvas.height = displayHeight;
			gl.uniform3f(iResolutionLocation, canvas.width, canvas.height, 1.0);
			gl.viewport(0, 0, canvas.width, canvas.height);
		}
	};

	function render() {
		updateCanvasSize();

		const currentTime = (performance.now() - startTime) / 1000;
		gl.uniform1f(iTimeLocation, currentTime);
		gl.uniform1f(iFrameLocation, Math.floor(currentTime * 60));

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		requestAnimationFrame(render);
	}

	render();
};
