import { normalizeValue } from './seed.js'

const vertex = /* glsl */ `#version 300 es
    in vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }`;

class GradientGL {
    // Private fields (prefixed with #)
    #gl
    #canvas
    #program
    #uniforms
    #timeScale
    #isActive
    #externalUniforms

    constructor(canvas, fragment, uniforms) {
        this.#gl = this.#createGLContext(canvas)
        this.#canvas = canvas
        this.#program = this.#createProgram(vertex, fragment)
        this.#uniforms = this.#getUniformLocations()
        this.#timeScale = 0.4
        this.#isActive = true
        this.#externalUniforms = uniforms

        this.#setupBuffers()
        this.#setupAttributes()
        this.#updateExternalUniforms()
        this.#render()
    }

    // Private methods (prefixed with #)
    #createGLContext(canvas) {
        const gl = canvas.getContext("webgl2", {
            preserveDrawingBuffer: true,
            antialias: false
        })
        if (!gl) throw new Error("WebGL2 not supported")
        return gl
    }

    #createShader(type, source) {
        const shader = this.#gl.createShader(type)
        this.#gl.shaderSource(shader, source)
        this.#gl.compileShader(shader)

        const log = this.#gl.getShaderInfoLog(shader)
        if (log) throw new Error(`${type === this.#gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'} shader compilation error: ${log}`)

        return shader
    }

    #createProgram(vertexSource, fragmentSource) {
        const program = this.#gl.createProgram()
        const vertexShader = this.#createShader(this.#gl.VERTEX_SHADER, vertexSource)
        const fragmentShader = this.#createShader(this.#gl.FRAGMENT_SHADER, fragmentSource)

        this.#gl.attachShader(program, vertexShader)
        this.#gl.attachShader(program, fragmentShader)
        this.#gl.linkProgram(program)

        const log = this.#gl.getProgramInfoLog(program)
        if (log) console.error("Program linking error:", log)

        // Clean up shaders after linking
        this.#gl.detachShader(program, vertexShader)
        this.#gl.detachShader(program, fragmentShader)
        this.#gl.deleteShader(vertexShader)
        this.#gl.deleteShader(fragmentShader)

        // Ensure program is active
        this.#gl.useProgram(program)
        return program
    }

    #setupBuffers() {
        const positionBuffer = this.#gl.createBuffer()
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, positionBuffer)
        this.#gl.bufferData(
            this.#gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            this.#gl.STATIC_DRAW
        )
    }

    #setupAttributes() {
        const positionLocation = this.#gl.getAttribLocation(this.#program, "position")
        this.#gl.enableVertexAttribArray(positionLocation)
        this.#gl.vertexAttribPointer(positionLocation, 2, this.#gl.FLOAT, false, 0, 0)
    }

    #getUniformLocations() {
        return {
            // Internal uniforms (updated every frame)
            iResolution: this.#gl.getUniformLocation(this.#program, "iResolution"),
            iTime: this.#gl.getUniformLocation(this.#program, "iTime"),
            iFrame: this.#gl.getUniformLocation(this.#program, "iFrame"),

            // External uniforms (set once, updated when options change)
            options: this.#gl.getUniformLocation(this.#program, "options"),
            timeScale: this.#gl.getUniformLocation(this.#program, "timeScale")
        }
    }

    #updateExternalUniforms() {
        if (!this.#externalUniforms) return
        this.#gl.useProgram(this.#program)
        this.#gl.uniform1iv(this.#uniforms.options, this.#externalUniforms)

        // Update timeScale from seed (normalized 0-9 to 0.1-2.0)
        const speed = normalizeValue(this.#externalUniforms[0]) / 255.0 * 1.9 + 0.1
        this.#gl.uniform1f(this.#uniforms.timeScale, speed)
    }

    setExternalUniforms(uniforms) {
        this.#externalUniforms = uniforms
        this.#updateExternalUniforms()
    }

    #updateInternalUniforms(time) {
        if (!this.#isActive) return

        const { iResolution, iTime, iFrame } = this.#uniforms

        // Ensure program is active
        this.#gl.useProgram(this.#program)

        // Update resolution if needed
        const displayWidth = this.#canvas.clientWidth
        const displayHeight = this.#canvas.clientHeight
        if (this.#canvas.width !== displayWidth || this.#canvas.height !== displayHeight) {
            this.#canvas.width = displayWidth
            this.#canvas.height = displayHeight
            this.#gl.uniform3f(iResolution, this.#canvas.width, this.#canvas.height, 1.0)
            this.#gl.viewport(0, 0, this.#canvas.width, this.#canvas.height)
        }

        // Update time-based uniforms
        this.#gl.uniform1f(iTime, time / 1000) // Pass raw time in seconds
        this.#gl.uniform1f(iFrame, Math.floor(time / 1000 * 60))
    }

    #render() {
        const frame = () => {
            if (!this.#isActive) return
            this.#updateInternalUniforms(performance.now())
            this.#gl.drawArrays(this.#gl.TRIANGLE_STRIP, 0, 4)
            requestAnimationFrame(frame)
        }

        frame()
    }

    // Cleanup method
    destroy() {
        this.#isActive = false
        this.#gl.deleteProgram(this.#program)
    }
}

export default GradientGL

