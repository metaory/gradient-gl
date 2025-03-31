import { createCanvas } from './dom.js'
import parseSeed from './seed.js'
import render from './gl.js'

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
  const [shaderId, uniforms] = parseSeed(seed)

  const [common, shader] = await Promise.all([
    fetchCommon(),
    fetchShader(shaderId),
  ])

  const fragment = common + shader + main

  const canvas = createCanvas(selector)

  render(canvas, fragment, uniforms)
}
