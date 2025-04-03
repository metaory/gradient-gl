const vertex = /* glsl */ `#version 300 es
    in vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }`;

const createGLContext = canvas => {
    const gl = canvas.getContext("webgl2")
    if (!gl) throw new Error("WebGL2 not supported")
    return gl
}

const createShader = (gl, type, source) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    const log = gl.getShaderInfoLog(shader)
    if (log) throw new Error(`${type === gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'} shader compilation error: ${log}`)

    return shader
}

const createGLProgram = (gl, vertexSource, fragmentSource) => {
    const program = gl.createProgram()
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    const log = gl.getProgramInfoLog(program)
    if (log) console.error("Program linking error:", log)

    return program
}

const setupBuffers = gl => {
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
    )
    return positionBuffer
}

const setupAttributes = (gl, program) => {
    const positionLocation = gl.getAttribLocation(program, "position")
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
}

const getUniformLocations = (gl, program) => ({
    iResolution: gl.getUniformLocation(program, "iResolution"),
    iTime: gl.getUniformLocation(program, "iTime"),
    iFrame: gl.getUniformLocation(program, "iFrame"),
    timeScale: gl.getUniformLocation(program, "timeScale")
})

const render = ({ gl, uniforms }, canvas) => {
    const startTime = performance.now()

    const frame = () => {
        const time = (performance.now() - startTime) / 1000
        setUniforms({ gl, uniforms }, canvas, time)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        requestAnimationFrame(frame)
    }

    frame()
}

export const createProgram = (canvas, fragment) => {
    const gl = createGLContext(canvas)
    const program = createGLProgram(gl, vertex, fragment)
    gl.useProgram(program)

    setupBuffers(gl)
    setupAttributes(gl, program)
    const uniforms = getUniformLocations(gl, program)

    render({ gl, uniforms }, canvas)

    return { gl, program, uniforms }
}

export const setUniforms = ({ gl, uniforms }, canvas, time) => {
    const { iResolution, iTime, iFrame, timeScale } = uniforms

    // Update resolution if needed
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth
        canvas.height = displayHeight
        gl.uniform3f(iResolution, canvas.width, canvas.height, 1.0)
        gl.viewport(0, 0, canvas.width, canvas.height)
    }

    // Update time-based uniforms
    gl.uniform1f(iTime, time)
    gl.uniform1f(iFrame, Math.floor(time * 60))
    gl.uniform1f(timeScale, 0.9)
}
