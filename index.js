// -----------------------------------------------------------------------------

const createCanvas = (selector = 'body') => {
  const targetElement = document.querySelector(selector) ?? document.body
  return targetElement.tagName === 'CANVAS'
    ? targetElement
    : targetElement.appendChild(
        Object.assign(document.createElement('canvas'), {
          style: 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;',
        }),
      )
}

// -----------------------------------------------------------------------------

// Normalize function for parsing hex seed values (0-F)
const normalize = (v) => {
  // Convert hex char to decimal value (0-15)
  const hexVal = Number.parseInt(v, 16)
  // Map 0-15 to 0-255 range
  return Math.round(Math.max(0, Math.min(hexVal, 15)) * (255 / 15))
}

// Non-linear mapping for more dramatic visual effect
// Maps 0-15 to a value with more dramatic steps
const nonLinearMap = (val, minOut, maxOut, power = 2) => {
  // Ensure val is in range 0-15
  const v = Math.max(0, Math.min(val, 15))

  // Special case for zero
  if (v === 0) return minOut

  // For values 1-15, use power curve for more dramatic effect
  // Normalize to 0-1 range (subtracting 1 to handle special zero case)
  const normalized = (v - 1) / 14

  // Apply power curve
  const curved = normalized ** power

  // Map to output range
  return minOut + curved * (maxOut - minOut)
}

const parseSeed = (s) => [
  s.split('.').shift(),
  new Uint8Array(s.split('.').pop().split('').map(normalize)),
]
const seedsEqual = (a, b) => a && b && a[0] === b[0] && a[1].every((v, i) => v === b[1][i])

// -----------------------------------------------------------------------------

const vertex = /* glsl */ `#version 300 es
    in vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }`

class GradientGL {
  #gl
  #canvas
  #program
  #uniforms
  #timeScale
  #isActive
  #externalUniforms
  #currentSeed
  #currentUniformValues

  constructor(canvas, fragment, seed) {
    this.#gl = this.#createGLContext(canvas)
    this.#canvas = canvas
    this.#program = this.#createProgram(vertex, fragment)
    this.#uniforms = this.#getUniformLocations()
    this.#timeScale = 0.4
    this.#isActive = true
    this.#currentSeed = seed
    this.#externalUniforms = seed[1]
    this.#currentUniformValues = { speed: 0, hueShift: 0, saturation: 0, lightness: 0 }

    this.#setupBuffers()
    this.#setupAttributes()
    this.#updateExternalUniforms(true) // Force update on initialization
    this.#render()
  }

  // Private methods (prefixed with #)
  #createGLContext(canvas) {
    const gl = canvas.getContext('webgl2', {
      preserveDrawingBuffer: true,
      antialias: false,
    })
    if (!gl) throw new Error('WebGL2 not supported')
    return gl
  }

  #createShader(type, source) {
    const shader = this.#gl.createShader(type)
    this.#gl.shaderSource(shader, source)
    this.#gl.compileShader(shader)

    const log = this.#gl.getShaderInfoLog(shader)
    if (log)
      throw new Error(
        `${type === this.#gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'} shader compilation error: ${log}`,
      )

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
    if (log) console.error('Program linking error:', log)

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
      this.#gl.STATIC_DRAW,
    )
  }

  #setupAttributes() {
    const positionLocation = this.#gl.getAttribLocation(this.#program, 'position')
    this.#gl.enableVertexAttribArray(positionLocation)
    this.#gl.vertexAttribPointer(positionLocation, 2, this.#gl.FLOAT, false, 0, 0)
  }

  #getUniformLocations() {
    return {
      // Internal uniforms (updated every frame)
      iResolution: this.#gl.getUniformLocation(this.#program, 'iResolution'),
      iTime: this.#gl.getUniformLocation(this.#program, 'iTime'),
      iFrame: this.#gl.getUniformLocation(this.#program, 'iFrame'),

      // External uniforms (set once, updated when options change)
      options: this.#gl.getUniformLocation(this.#program, 'options'),
      timeScale: this.#gl.getUniformLocation(this.#program, 'timeScale'),
      hueShift: this.#gl.getUniformLocation(this.#program, 'hueShift'),
      saturation: this.#gl.getUniformLocation(this.#program, 'saturation'),
      lightness: this.#gl.getUniformLocation(this.#program, 'lightness'),
    }
  }

  #updateExternalUniforms(forceUpdate = false) {
    if (!this.#externalUniforms) return
    this.#gl.useProgram(this.#program)
    this.#gl.uniform1iv(this.#uniforms.options, this.#externalUniforms)

    // Get values 0-15 by converting back from the normalized 0-255 range
    const speedVal = Math.round((this.#externalUniforms[0] * 15) / 255)
    const hueVal = Math.round((this.#externalUniforms[1] * 15) / 255)
    const satVal = Math.round((this.#externalUniforms[2] * 15) / 255)
    const lightVal = Math.round((this.#externalUniforms[3] * 15) / 255)

    // Convert to hex for logging
    const speedHex = speedVal.toString(16)
    const hueHex = hueVal.toString(16)
    const satHex = satVal.toString(16)
    const lightHex = lightVal.toString(16)

    console.log('EXT', {
      speedVal: `${speedVal} (${speedHex})`,
      hueVal: `${hueVal} (${hueHex})`,
      satVal: `${satVal} (${satHex})`,
      lightVal: `${lightVal} (${lightHex})`,
    })

    // Speed: 0=very slow, 15=very fast (0.1-3.0 range with non-linear steps)
    // Keep a minimum value to prevent freezing
    const speed = nonLinearMap(speedVal, 0.1, 3.0, 1.5)

    // Hue: 0=no shift, 15=full cycle (0.0-1.0 range)
    // For hue, a linear distribution is fine since it's a circular value
    const hueShift = hueVal / 15

    // Saturation: 0=slightly desaturated, 15=super saturated (0.7-5.0 range with non-linear steps)
    const satFactor = nonLinearMap(satVal, 0.7, 5.0, 2)

    // Lightness: 0=dark, 15=bright (0.3-2.0 range with non-linear steps)
    const lightFactor = nonLinearMap(lightVal, 0.3, 2.0, 1.8)

    // Check if any values changed or force update is requested
    const valuesChanged =
      forceUpdate ||
      speed !== this.#currentUniformValues.speed ||
      hueShift !== this.#currentUniformValues.hueShift ||
      satFactor !== this.#currentUniformValues.saturation ||
      lightFactor !== this.#currentUniformValues.lightness

    if (valuesChanged) {
      // Update all uniforms
      this.#gl.uniform1f(this.#uniforms.timeScale, speed)
      this.#gl.uniform1f(this.#uniforms.hueShift, hueShift)
      this.#gl.uniform1f(this.#uniforms.saturation, satFactor)
      this.#gl.uniform1f(this.#uniforms.lightness, lightFactor)

      // Save current values
      this.#currentUniformValues = {
        speed,
        hueShift,
        saturation: satFactor,
        lightness: lightFactor,
      }

      console.log(
        'INT',
        {
          speed: `${speed.toFixed(2)} (${speedHex})`,
          hueShift: `${hueShift.toFixed(2)} (${hueHex})`,
          saturation: `${satFactor.toFixed(2)} (${satHex})`,
          lightness: `${lightFactor.toFixed(2)} (${lightHex})`,
        },
        'UPDATED',
      )
    } else {
      console.log(
        'INT',
        {
          speed: `${speed.toFixed(2)} (${speedHex})`,
          hueShift: `${hueShift.toFixed(2)} (${hueHex})`,
          saturation: `${satFactor.toFixed(2)} (${satHex})`,
          lightness: `${lightFactor.toFixed(2)} (${lightHex})`,
        },
        'NO CHANGE',
      )
    }
  }

  updateSeed(seed) {
    if (seedsEqual(seed, this.#currentSeed)) return false

    this.#currentSeed = seed
    this.#externalUniforms = seed[1]
    this.#updateExternalUniforms(true) // Force update when seed changes
    return true
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
    this.#gl.uniform1f(iFrame, Math.floor((time / 1000) * 60))
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

    // Clean up WebGL resources
    if (this.#program) {
      this.#gl.deleteProgram(this.#program)
      this.#program = null
    }

    // Clean up canvas
    if (this.#canvas) {
      this.#canvas.remove()
      this.#canvas = null
    }

    // Clean up GL context
    this.#gl = null
  }
}

// -----------------------------------------------------------------------------

const fetchCommon = () => import('./shaders/common.glsl.js').then((module) => module.default)
const fetchShader = (shader) =>
  import(`./shaders/${shader}.glsl.js`).then((module) => module.default)

const main = /* glsl */ `
void main() {
  fragColor = shader(gl_FragCoord.xy);
}
`

// Cache for loaded shaders
const shaderCache = {}
let activeProgram = null
let lastSeed = null

/**
 * Creates a WebGL gradient animation
 * @param {string} seed - Required seed string in format `{shader}.{speed}{hue}{saturation}{lightness}`
 * @param {string} [selector='body'] - Optional CSS selector for the parent element
 * @returns {Promise<GradientGL>} Instance of the gradient animation
 * @example
 * // Basic usage
 * await gradientGL('a2.eba9')
 *
 * // With custom parent element
 * await gradientGL('a2.eba9', '#app')
 */
export default async (seed, selector = 'body') => {
  if (!seed) throw new Error('Seed is required')

  const parsedSeed = parseSeed(seed)
  const [shaderId, uniforms] = parsedSeed

  // If active program exists and shader hasn't changed, just update the uniforms
  if (activeProgram) {
    if (activeProgram.shaderId === shaderId) {
      const updated = activeProgram.updateSeed(parsedSeed)
      return activeProgram
    }
    // Properly destroy the old program before creating a new one
    activeProgram.destroy()
    activeProgram = null
  }

  // Load shader from cache or fetch it
  let fragment
  if (shaderCache[shaderId]) {
    fragment = shaderCache[shaderId]
  } else {
    const [common, shader] = await Promise.all([fetchCommon(), fetchShader(shaderId)])
    fragment = common + shader + main
    shaderCache[shaderId] = fragment
  }

  const canvas = createCanvas(selector)
  const program = new GradientGL(canvas, fragment, parsedSeed)
  program.shaderId = shaderId // Store shaderId for future reference
  activeProgram = program
  lastSeed = seed

  return program
}

// -----------------------------------------------------------------------------
