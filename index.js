// -----------------------------------------------------------------------------

const createCanvas = (selector = 'body') => {
  const target = document.querySelector(selector) ?? document.body
  return target.tagName === 'CANVAS'
    ? target
    : target.appendChild(
      Object.assign(document.createElement('canvas'), {
        id: 'gradient-gl',
        style: 'position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;',
      }),
    )
}

// -----------------------------------------------------------------------------

// Pure utility functions
const normalize = v => {
  const value = Number.parseInt(v, 16)
  return Math.round(value * (255 / 15)) // Map 0-15 to 0-255
}
const nonLinearMap = (val, minOut, maxOut, power = 2) => {
  const v = Math.max(0, Math.min(val, 15))
  return v === 0 ? minOut : minOut + ((v - 1) / 14) ** power * (maxOut - minOut)
}

const parseSeed = s => [
  s.split('.').shift(),
  new Uint8Array(s.split('.').pop().split('').map(normalize)),
]

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
  #fragment
  #vertex
  #lastTime
  #elapsedTime

  // Time interpolation constants
  static #MAX_DELTA = 50 // Maximum frame delta in ms (~20fps minimum)

  constructor(canvas, fragment, seed) {
    this.#canvas = canvas
    this.#fragment = fragment
    this.#vertex = vertex
    this.#timeScale = 0.4
    this.#isActive = false
    this.#currentSeed = seed
    this.#externalUniforms = seed[1]
    this.#currentUniformValues = { speed: 0, hueShift: 0, saturation: 0, lightness: 0 }
    this.#lastTime = null
    this.#elapsedTime = 0

    this.#setupEventHandlers()
  }

  #setupEventHandlers() {
    this.#canvas.addEventListener('webglcontextlost', e => {
      e.preventDefault()
      this.#isActive = false
      this.#gl = null
      this.#program = null
      this.#uniforms = null
      if (this.#canvas) this.#canvas.width = 0
    })

    this.#canvas.addEventListener('webglcontextrestored', () => {
      this.init()
    })

    // document.addEventListener('visibilitychange', () => {
    //   if (!document.hidden && !this.#isActive) this.init()
    // })
  }

  init() {
    this.#gl = this.#createGLContext(this.#canvas)
    this.#program = this.#createProgram(this.#vertex, this.#fragment)
    this.#uniforms = this.#getUniformLocations()
    this.#isActive = true

    this.#setupBuffers()
    this.#setupAttributes()
    this.#updateExternalUniforms(true)
    this.#render()
  }

  #createGLContext(canvas) {
    const gl = canvas.getContext('webgl2', {
      antialias: true,
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
      iResolution: this.#gl.getUniformLocation(this.#program, 'iResolution'),
      iTime: this.#gl.getUniformLocation(this.#program, 'iTime'),
      iFrame: this.#gl.getUniformLocation(this.#program, 'iFrame'),
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

    const [speedVal, hueVal, satVal, lightVal] = this.#externalUniforms.map(v =>
      Math.round((v * 15) / 255),
    )
    const [speed, hueShift, satFactor, lightFactor] = [
      nonLinearMap(speedVal, 0.1, 3.0, 1.5),
      hueVal / 15,
      nonLinearMap(satVal, 0.3, 3.0, 1.5),
      lightVal / 15, // Simple linear mapping from 0 to 1
    ]

    const valuesChanged =
      forceUpdate ||
      speed !== this.#currentUniformValues.speed ||
      hueShift !== this.#currentUniformValues.hueShift ||
      satFactor !== this.#currentUniformValues.saturation ||
      lightFactor !== this.#currentUniformValues.lightness

    if (valuesChanged) {
      this.#gl.uniform1f(this.#uniforms.timeScale, speed)
      this.#gl.uniform1f(this.#uniforms.hueShift, hueShift)
      this.#gl.uniform1f(this.#uniforms.saturation, satFactor)
      this.#gl.uniform1f(this.#uniforms.lightness, lightFactor)

      this.#currentUniformValues = {
        speed,
        hueShift,
        saturation: satFactor,
        lightness: lightFactor,
      }
    }
  }

  updateSeed(seed) {
    if (seed[0] === this.#currentSeed[0] && seed[1].every((v, i) => v === this.#currentSeed[1][i]))
      return false
    this.#currentSeed = seed
    this.#externalUniforms = seed[1]
    this.#updateExternalUniforms(true)
    return true
  }

  #updateInternalUniforms(time) {
    if (!this.#isActive || !this.#canvas || !this.#gl) return

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

    // Use elapsed time for smooth animation
    const continuousTime = time / 1000

    this.#gl.uniform1f(iTime, continuousTime)
    this.#gl.uniform1f(iFrame, Math.floor(continuousTime * 60))
  }

  #updateTime(currentTime) {
    if (this.#lastTime !== null) {
      const delta = Math.min(currentTime - this.#lastTime, GradientGL.#MAX_DELTA)
      this.#elapsedTime += delta
    }
    this.#lastTime = currentTime
  }

  #render() {
    const frame = () => {
      if (!this.#isActive || !this.#canvas || !this.#gl) {
        return
      }

      const currentTime = performance.now()
      this.#updateTime(currentTime)
      this.#updateInternalUniforms(this.#elapsedTime)
      this.#gl.drawArrays(this.#gl.TRIANGLE_STRIP, 0, 4)
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }

  destroy() {
    this.#isActive = false
    if (this.#program && this.#gl) {
      this.#gl.deleteProgram(this.#program)
    }
    if (this.#canvas) {
      try {
        this.#canvas.remove()
      } catch (e) { }
    }
    this.#program = null
    this.#canvas = null
    this.#gl = null
  }
}

// -----------------------------------------------------------------------------

import common from './shaders/common.glsl.js'

const fetchCommon = () => Promise.resolve(common)
// Static-analyser friendly map; no dynamic import paths; tree-shake + per-shader split
const shaderLoaders = {
  a1: () => import('./shaders/a1.glsl.js'),
  a2: () => import('./shaders/a2.glsl.js'),
  b1: () => import('./shaders/b1.glsl.js'),
  b2: () => import('./shaders/b2.glsl.js'),
  b3: () => import('./shaders/b3.glsl.js'),
  b4: () => import('./shaders/b4.glsl.js'),
  b5: () => import('./shaders/b5.glsl.js'),
  f1: () => import('./shaders/f1.glsl.js'),
  f2: () => import('./shaders/f2.glsl.js'),
  f3: () => import('./shaders/f3.glsl.js'),
  n1: () => import('./shaders/n1.glsl.js'),
  n2: () => import('./shaders/n2.glsl.js'),
}
const fetchShader = async id => {
  const loader = shaderLoaders[id]
  if (!loader) throw new Error('Unknown shader')
  const mod = await loader()
  return mod.default
}

const main = /* glsl */ `
  void main() {
    fragColor = shader(gl_FragCoord.xy);
  }
  `

let activeProgram = null

export default async function boot(seed, selector = 'body') {
  if (!seed) throw new Error('Seed is required')

  const parsedSeed = parseSeed(seed)
  const [shaderId] = parsedSeed

  if (activeProgram?.shaderId === shaderId) {
    activeProgram.updateSeed(parsedSeed)
    return activeProgram
  }

  if (activeProgram) {
    activeProgram.destroy()
    activeProgram = null
  }

  const [common, shader] = await Promise.all([fetchCommon(), fetchShader(shaderId)])
  const fragment = common + shader + main
  const canvas = createCanvas(selector)
  const program = new GradientGL(canvas, fragment, parsedSeed)
  program.shaderId = shaderId
  program.init()
  activeProgram = program

  return program
}

// -----------------------------------------------------------------------------

const url = new URL(import.meta.url)
const seed = url.searchParams.get('seed')
const selector = url.searchParams.get('selector') || 'body'
if (seed) boot(seed, selector)
