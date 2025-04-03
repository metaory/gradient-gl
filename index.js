import { createCanvas } from './dom.js'
import parseSeed from './seed.js'
import GradientGL from './gl.js'

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

  console.log('>>', uniforms)
  const program = new GradientGL(canvas, fragment, {timeScale: 0.6})
  console.log('>>', program)
  setTimeout(() => {
    console.log('UPDATE 1')
    program.setTimeScale(0.2)
  }, 3000)

  setTimeout(() => {
    console.log('UPDATE 2')
    program.setTimeScale(0.8)
  }, 8000)

  setTimeout(() => {
    console.log('UPDATE 2')
    program.setTimeScale(0.2)
  }, 16000)
}
