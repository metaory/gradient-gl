import { createCanvas } from './dom.js'
import parseSeed from './seed.js'
import { createProgram } from './gl.js'

const main = /* glsl */ `
void main() {
  fragColor = shader(gl_FragCoord.xy);
}
`

const fetchCommon = () =>
  import('./shaders/common.glsl.js').then((module) => module.default)

const fetchShader = (shader) =>
  import(`./shaders/${shader}.glsl.js`).then((module) => module.default)

export default async (seed, selector = 'body') => {
    console.log(' ⛊ ', seed, selector, ' ⛊ ')
  const [shaderId, uniforms] = parseSeed(seed)

  const [common, shader] = await Promise.all([
    fetchCommon(),
    fetchShader(shaderId),
  ])

  const fragment = common + shader + main

  const canvas = createCanvas(selector)

  createProgram(canvas, fragment, uniforms)
}
