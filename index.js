// -----------------------------------------------------------------------------

const ownedStyle = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;pointer-events:none'
const isCanvas = el => el?.tagName === 'CANVAS'

const sizeCanvas = canvas => {
  if (canvas.clientWidth && canvas.clientHeight) return canvas
  canvas.style.width ||= '100%'
  canvas.style.height ||= '100%'
  return canvas
}

const createCanvas = target => {
  if (isCanvas(target)) return sizeCanvas(target)

  for (const canvas of document.querySelectorAll('#gradient-gl')) canvas.remove()

  return target.appendChild(Object.assign(document.createElement('canvas'), {
    id: 'gradient-gl',
    style: ownedStyle,
  }))
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
  #ownsCanvas
  #program
  #uniforms
  #isActive
  #externalUniforms
  #currentSeed
  #currentUniformValues
  #fragment
  #vertex
  #lastTime
  #elapsedTime
  #size = [0, 0]
  #observer
  #abort = new AbortController()

  // Time interpolation constants
  static #MAX_DELTA = 50 // Maximum frame delta in ms (~20fps minimum)
  static #FRAME_MS = 1000 / 30 - 2 // 30fps cap, slack absorbs rAF jitter
  // Only owned canvases are CSS-sized; scaling an intrinsically sized canvas collapses it
  static #SCALE = 0.5

  constructor(canvas, fragment, seed, ownsCanvas) {
    this.#canvas = canvas
    this.#ownsCanvas = ownsCanvas
    this.#fragment = fragment
    this.#vertex = vertex
    this.#isActive = false
    this.#currentSeed = seed
    this.#externalUniforms = seed[1]
    this.#currentUniformValues = { speed: 0, hueShift: 0, saturation: 0, lightness: 0 }
    this.#lastTime = null
    this.#elapsedTime = 0
    const scale = ownsCanvas ? GradientGL.#SCALE : 1
    this.#observer = new ResizeObserver(([{ contentBoxSize: [box] }]) => {
      this.#size = [box.inlineSize, box.blockSize].map(v => Math.round(v * scale))
    })
    this.#observer.observe(canvas)

    this.#setupEventHandlers()
  }

  #setupEventHandlers() {
    const { signal } = this.#abort
    this.#canvas.addEventListener('webglcontextlost', e => {
      if (!this.#isActive) return
      e.preventDefault()
      this.#isActive = false
      this.#gl = null
      this.#program = null
      this.#uniforms = null
      if (this.#canvas) this.#canvas.width = 0
    }, { signal })

    this.#canvas.addEventListener('webglcontextrestored', () => {
      if (this.#canvas) this.init()
    }, { signal })
  }

  init() {
    if (!this.#canvas) return
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

    if (this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) return shader
    const kind = type === this.#gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'
    throw new Error(`${kind} shader compilation error: ${this.#gl.getShaderInfoLog(shader)}`)
  }

  #createProgram(vertexSource, fragmentSource) {
    const program = this.#gl.createProgram()
    const vertexShader = this.#createShader(this.#gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = this.#createShader(this.#gl.FRAGMENT_SHADER, fragmentSource)

    this.#gl.attachShader(program, vertexShader)
    this.#gl.attachShader(program, fragmentShader)
    this.#gl.linkProgram(program)

    if (!this.#gl.getProgramParameter(program, this.#gl.LINK_STATUS))
      throw new Error(`Program linking error: ${this.#gl.getProgramInfoLog(program)}`)

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
    const names = [
      'iResolution', 'iTime', 'options', 'timeScale', 'hueShift', 'saturation', 'lightness',
    ]
    return Object.fromEntries(
      names.map(name => [name, this.#gl.getUniformLocation(this.#program, name)]),
    )
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
      lightVal / 15,
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

  isMounted(target) {
    if (!this.#isActive || !this.#gl || !this.#program) return false
    if (!this.#canvas?.isConnected) return false
    return isCanvas(target) ? this.#canvas === target : this.#canvas.parentElement === target
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

    const { iResolution, iTime } = this.#uniforms
    const [width, height] = this.#size
    this.#gl.useProgram(this.#program)

    const resized = width && height
      && (this.#canvas.width !== width || this.#canvas.height !== height)
    if (resized) {
      this.#canvas.width = width
      this.#canvas.height = height
      this.#gl.viewport(0, 0, width, height)
    }

    const seconds = time / 1000
    this.#gl.uniform3f(iResolution, this.#canvas.width, this.#canvas.height, 1.0)
    this.#gl.uniform1f(iTime, seconds)
  }

  #updateTime(currentTime) {
    if (this.#lastTime !== null) {
      const delta = Math.min(currentTime - this.#lastTime, GradientGL.#MAX_DELTA)
      this.#elapsedTime += delta
    }
    this.#lastTime = currentTime
  }

  #render() {
    const frame = now => {
      if (!this.#isActive || !this.#canvas || !this.#gl) return
      if (!this.#canvas.isConnected) return this.destroy()

      requestAnimationFrame(frame)
      if (now - (this.#lastTime ?? -Infinity) < GradientGL.#FRAME_MS) return

      this.#updateTime(now)
      this.#updateInternalUniforms(this.#elapsedTime)
      this.#gl.drawArrays(this.#gl.TRIANGLE_STRIP, 0, 4)
    }
    requestAnimationFrame(frame)
  }

  destroy(preserveCanvas) {
    this.#isActive = false
    this.#observer?.disconnect()
    this.#abort.abort()
    if (this.#program && this.#gl) this.#gl.deleteProgram(this.#program)
    const reuse = this.#canvas === preserveCanvas
    if (this.#ownsCanvas && !reuse) {
      this.#gl?.getExtension('WEBGL_lose_context')?.loseContext()
      this.#canvas?.remove()
    }
    this.#program = null
    this.#canvas = null
    this.#gl = null
    if (activeProgram === this) activeProgram = null
  }
}

// -----------------------------------------------------------------------------

import common from './shaders/common.glsl.js'

// Static map. No dynamic import paths, so each shader can tree-shake.
const shaderLoaders = {
  b1: () => import('./shaders/b1.glsl.js'),
  b2: () => import('./shaders/b2.glsl.js'),
  b3: () => import('./shaders/b3.glsl.js'),
  b4: () => import('./shaders/b4.glsl.js'),

  c1: () => import('./shaders/c1.glsl.js'),
  c4: () => import('./shaders/c4.glsl.js'),

  f1: () => import('./shaders/f1.glsl.js'),
  f3: () => import('./shaders/f3.glsl.js'),

  l1: () => import('./shaders/l1.glsl.js'),
  l3: () => import('./shaders/l3.glsl.js'),
  l5: () => import('./shaders/l5.glsl.js'),

  n1: () => import('./shaders/n1.glsl.js'),
  n2: () => import('./shaders/n2.glsl.js'),
  n3: () => import('./shaders/n3.glsl.js'),
  n4: () => import('./shaders/n4.glsl.js'),

  s1: () => import('./shaders/s1.glsl.js'),
  s3: () => import('./shaders/s3.glsl.js'),
}

export const shaderIds = Object.keys(shaderLoaders).sort()

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
let bootLock = Promise.resolve()

export default function boot(seed, selector = 'body') {
  const task = bootLock.then(async () => {
    if (!seed) throw new Error('Seed is required')

    const parsedSeed = parseSeed(seed)
    const [shaderId] = parsedSeed
    const target = document.querySelector(selector) ?? document.body

    if (activeProgram?.shaderId === shaderId && activeProgram.isMounted(target)) {
      activeProgram.updateSeed(parsedSeed)
      return activeProgram
    }

    if (activeProgram) {
      activeProgram.destroy(target)
      activeProgram = null
    }

    const shader = await fetchShader(shaderId)
    const fragment = common + shader + main
    const canvas = createCanvas(target)
    const program = new GradientGL(canvas, fragment, parsedSeed, !isCanvas(target))
    program.shaderId = shaderId
    program.init()
    activeProgram = program
    return program
  })

  bootLock = task.catch(() => {})
  return task
}

// -----------------------------------------------------------------------------

const url = new URL(import.meta.url)
const seed = url.searchParams.get('seed')
const selector = url.searchParams.get('selector') || 'body'
if (seed) boot(seed, selector)
window.gradient = boot
