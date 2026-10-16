import assert from 'node:assert/strict'
import { afterEach, beforeEach, mock, test } from 'node:test'

const elements = new Set()
const frames = []
const gl = new Proxy({}, {
  get: (target, key) => target[key] ??= /^[A-Z_]+$/.test(key)
    ? 1
    : mock.fn(() => key.includes('InfoLog') ? '' : {}),
})
class Element {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase()
    this.parentElement = null
    this.clientWidth = 640
    this.clientHeight = 480
    elements.add(this)
  }
  get isConnected() {
    return this === document.body || Boolean(this.parentElement?.isConnected)
  }
  appendChild(child) {
    child.parentElement = this
    return child
  }
  remove() { this.parentElement = null }
  addEventListener() {}
  getContext() { return gl }
}
globalThis.document = {
  createElement: tag => new Element(tag),
  querySelector: selector => selector === 'body' ? document.body
    : [...elements].find(element => element.isConnected && `#${element.id}` === selector),
  querySelectorAll: selector => [...elements].filter(element =>
    element.isConnected && `#${element.id}` === selector),
}
document.body = new Element('body')
globalThis.window = {}
globalThis.requestAnimationFrame = frame => frames.push(frame)
const { default: gradientGL } = await import('../index.js')
const mount = (id = 'meeting-gradient', tag = 'main') => document.body.appendChild(
  Object.assign(new Element(tag), { id }),
)
const canvas = () => document.querySelector('#gradient-gl')
const tick = () => frames.splice(0).map(frame => frame())
beforeEach(() => mount())
afterEach(async () => {
  const program = await gradientGL('c1.915c')
  program.destroy()
  frames.splice(0)
  elements.clear()
})

test('same shader and target reuses a live program and updates seed', async () => {
  const program = await gradientGL('c1.915c', '#meeting-gradient')
  const calls = gl.uniform1iv.mock.callCount()
  assert.equal(await gradientGL('c1.a15c', '#meeting-gradient'), program)
  assert.equal(gl.uniform1iv.mock.callCount(), calls + 1)
  assert.equal(canvas().parentElement.id, 'meeting-gradient')
})

;['c1.915c', 'c1.a15c'].map(seed => test(`destroy then boot ${seed} recreates`, async () => {
  const program = await gradientGL('c1.915c', '#meeting-gradient')
  const oldCanvas = canvas()
  program.destroy()
  const next = await gradientGL(seed, '#meeting-gradient')
  assert.notEqual(next, program)
  assert.notEqual(canvas(), oldCanvas)
  assert.ok(canvas().isConnected)
  program.destroy()
  assert.equal(await gradientGL(seed, '#meeting-gradient'), next)
}))

;['replaced container', 'different target', 'detached canvas'].map(scenario =>
  test(`${scenario} recreates the same shader`, async () => {
    const program = await gradientGL('c1.915c', '#meeting-gradient')
    const oldCanvas = canvas()
    const selector = scenario === 'different target' ? '#other' : '#meeting-gradient'
    if (scenario === 'replaced container') document.querySelector(selector).remove()
    if (scenario === 'detached canvas') oldCanvas.remove()
    if (scenario !== 'detached canvas') mount(selector.slice(1))
    const next = await gradientGL('c1.915c', selector)
    assert.notEqual(next, program)
    assert.notEqual(canvas(), oldCanvas)
    assert.equal(canvas().parentElement, document.querySelector(selector))
    assert.equal(document.querySelectorAll('#gradient-gl').length, 1)
  }),
)

test('direct canvas identity controls reuse', async () => {
  const first = mount('first', 'canvas')
  const program = await gradientGL('c1.915c', '#first')
  assert.equal(await gradientGL('c1.a15c', '#first'), program)
  const second = mount('second', 'canvas')
  assert.notEqual(await gradientGL('c1.915c', '#second'), program)
  assert.ok(second.isConnected)
  assert.ok(first.isConnected)
})

test('generated canvas can become the direct target when switching shaders', async () => {
  const program = await gradientGL('c1.915c')
  const target = canvas()
  const next = await gradientGL('b1.915c', '#gradient-gl')
  tick()
  assert.notEqual(next, program)
  assert.ok(next.isMounted(target))
})

test('shader switch preserves the requested caller-owned canvas', async () => {
  const target = mount('target', 'canvas')
  const program = await gradientGL('c1.915c', '#target')
  const next = await gradientGL('b1.915c', '#target')
  assert.notEqual(next, program)
  tick()
  assert.ok(next.isMounted(target))
  next.destroy()
  assert.ok(target.isConnected)
  assert.notEqual(await gradientGL('b1.915c', '#target'), next)
})

;['destroyed', 'detached'].map(state => test(`${state} stops drawing and scheduling`, async () => {
  const program = await gradientGL('c1.915c', '#meeting-gradient')
  tick()
  const calls = gl.drawArrays.mock.callCount()
  if (state === 'destroyed') program.destroy()
  if (state === 'detached') canvas().remove()
  tick()
  assert.equal(gl.drawArrays.mock.callCount(), calls)
  assert.equal(frames.length, 0)
  program.destroy()
}))
