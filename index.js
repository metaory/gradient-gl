// -----------------------------------------------------------------------------

const createCanvas = (selector = 'body') => {
  const target = document.querySelector(selector) ?? document.body
  return target.tagName === 'CANVAS'
    ? target
    : target.appendChild(
        Object.assign(document.createElement('canvas'), {
          style: 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;'
        })
      )
}

// -----------------------------------------------------------------------------

// Pure utility functions
const normalize = v => {
    const value = Number.parseInt(v, 16)
    return Math.round(value * (255 / 15))  // Map 0-15 to 0-255
}

// Linear mapping from input range [0-15] to output range [min-max]
const linearMap = (val, min, max) => {
  const v = Math.max(0, Math.min(val, 15))
  return min + (v / 15) * (max - min)
}

const parseSeed = s => {
  if (!s) throw new Error('Seed is required')
  const [shaderId, values] = s.split('.')
  if (!shaderId || !values || values.length !== 4) throw new Error('Invalid seed format')
  return [shaderId, new Uint8Array(values.split('').map(normalize))]
}

// -----------------------------------------------------------------------------

const vertex = /* glsl */ `#version 300 es
    in vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }`

const calculateLightness = (lightVal, satVal) => {
  // Special case for minimum lightness (near black)
  if (lightVal === 0) return 0.05;

  // Special case for maximum lightness (near white)
  // Higher boost when saturation is low for true whites
  if (lightVal === 15) {
    // If saturation is low (0-3), push even more toward white
    return satVal <= 3 ? 5.0 : 3.5;
  }

  // For mid-range, use a more linear progression
  // Map 1-14 to a wider range of 0.2-3.0
  const normalizedLight = lightVal / 15;
  const baseLight = 0.2 + normalizedLight * 2.8;

  // Apply a slight curve (less dramatic than before)
  return baseLight * (1.0 + normalizedLight * 0.5);
}

class GradientGL {
  #gl
  #canvas
  #program
  #uniforms
  #isActive
  #currentSeed
  #externalUniforms
  #currentUniformValues

  constructor(canvas, fragment, seed, opts = {}) {
    this.#gl = this.#createGLContext(canvas)
    this.#canvas = canvas
    this.#program = this.#createProgram(vertex, fragment)
    this.#uniforms = this.#getUniformLocations()
    this.#isActive = false // don't start yet
    this.#currentSeed = seed
    this.#externalUniforms = seed[1]
    this.#currentUniformValues = { speed: 0, hueShift: 0, saturation: 0, lightness: 0 }

    this.#setupBuffers()
    this.#setupAttributes()
    this.#updateExternalUniforms(true)

    if (opts.autoplay !== false) {
      this.start()
    }
  }

  start() {
    if (this.#isActive) return
    this.#isActive = true
    this.#render()
  }

  #createGLContext(canvas) {
    const gl = canvas.getContext('webgl2', {
      preserveDrawingBuffer: true,
      antialias: false
    })
    if (!gl) throw new Error('WebGL2 not supported')
    return gl
  }

  #createShader(type, source) {
    const shader = this.#gl.createShader(type)
    this.#gl.shaderSource(shader, source)
    this.#gl.compileShader(shader)

    const log = this.#gl.getShaderInfoLog(shader)
    if (log) throw new Error(
      `${type === this.#gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'} shader compilation error: ${log}`
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
    if (log) throw new Error(`Program linking error: ${log}`)

    this.#gl.detachShader(program, vertexShader)
    this.#gl.detachShader(program, fragmentShader)
    this.#gl.deleteShader(vertexShader)
    this.#gl.deleteShader(fragmentShader)

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
    const positionLocation = this.#gl.getAttribLocation(this.#program, 'position')
    this.#gl.enableVertexAttribArray(positionLocation)
    this.#gl.vertexAttribPointer(positionLocation, 2, this.#gl.FLOAT, false, 0, 0)
  }

  #getUniformLocations() {
    return {
      iResolution: this.#gl.getUniformLocation(this.#program, 'iResolution'),
      iTime: this.#gl.getUniformLocation(this.#program, 'iTime'),
      iFrame: this.#gl.getUniformLocation(this.#program, 'iFrame'),
      options: this.#gl.getUniformLocation(this.#program, 'options'),
      timeScale: this.#gl.getUniformLocation(this.#program, 'timeScale'),
      hueShift: this.#gl.getUniformLocation(this.#program, 'hueShift'),
      saturation: this.#gl.getUniformLocation(this.#program, 'saturation'),
      lightness: this.#gl.getUniformLocation(this.#program, 'lightness')
    }
  }

  pause() {
    this.#isActive = false
  }

  updateSeed(seed) {
    if (seed[0] === this.#currentSeed[0] && seed[1].every((v, i) => v === this.#currentSeed[1][i])) {
      return false
    }
    this.#currentSeed = seed
    this.#externalUniforms = seed[1]
    this.#updateExternalUniforms(true)
    return true
  }

  #updateExternalUniforms(forceUpdate = false) {
    if (!this.#externalUniforms) return

    this.#gl.useProgram(this.#program)
    this.#gl.uniform1iv(this.#uniforms.options, this.#externalUniforms)

    const [speedVal, hueVal, satVal, lightVal] = this.#externalUniforms.map(v => Math.round((v / 255) * 15))
    const [speed, hueShift, satFactor, lightFactor] = [
      linearMap(speedVal, 0.2, 2.5),
      hueVal / 15,
      linearMap(satVal, 0.0, 2.0),
      linearMap(lightVal, 0.05, 2.0)
    ]

    const valuesChanged = forceUpdate ||
      speed !== this.#currentUniformValues.speed ||
      hueShift !== this.#currentUniformValues.hueShift ||
      satFactor !== this.#currentUniformValues.saturation ||
      lightFactor !== this.#currentUniformValues.lightness

    if (valuesChanged) {
      this.#gl.uniform1f(this.#uniforms.timeScale, speed)
      this.#gl.uniform1f(this.#uniforms.hueShift, hueShift)
      this.#gl.uniform1f(this.#uniforms.saturation, satFactor)
      this.#gl.uniform1f(this.#uniforms.lightness, lightFactor)

      this.#currentUniformValues = { speed, hueShift, saturation: satFactor, lightness: lightFactor }
    }
  }

  #updateInternalUniforms(time) {
    if (!this.#isActive) return

    const { iResolution, iTime, iFrame } = this.#uniforms
    this.#gl.useProgram(this.#program)

    const displayWidth = this.#canvas.clientWidth
    const displayHeight = this.#canvas.clientHeight
    if (this.#canvas.width !== displayWidth || this.#canvas.height !== displayHeight) {
      this.#canvas.width = displayWidth
      this.#canvas.height = displayHeight
      this.#gl.uniform3f(iResolution, this.#canvas.width, this.#canvas.height, 1.0)
      this.#gl.viewport(0, 0, this.#canvas.width, this.#canvas.height)
    }

    this.#gl.uniform1f(iTime, time / 1000)
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

  destroy() {
    this.pause()
    if (this.#program) {
      this.#gl.deleteProgram(this.#program)
      this.#program = null
    }
    this.#canvas = null
    this.#gl = null
  }
}

// -----------------------------------------------------------------------------

const main = /* glsl */ `
void main() {
  fragColor = shader(gl_FragCoord.xy);
}
`

export default async (seed, selector = 'body', opts = {}) => {
  const parsedSeed = parseSeed(seed)
  const [shaderId] = parsedSeed

  const [common, shader] = await Promise.all([
    import('./shaders/common.glsl.js').then(m => m.default),
    import(`./shaders/${shaderId}.glsl.js`).then(m => m.default)
  ])

  const canvas = createCanvas(selector)
  const program = new GradientGL(canvas, common + shader + main, parsedSeed, opts)
  program.shaderId = shaderId
  return program
}
