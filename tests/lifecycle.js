import assert from 'node:assert/strict'
import { afterEach, beforeEach, mock, test } from 'node:test'

const elements = new Set()
const frames = []
const loseContext = mock.fn()
const gl = new Proxy({
  getExtension: mock.fn(() => ({ loseContext })),
}, {
  get: (target, key) => {
    if (key in target) return target[key]
    const value = /^[A-Z_]+$/.test(key)
      ? 1
      : mock.fn(() => key.includes('InfoLog') ? '' : {})
    target[key] = value
    return value
  },
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
const matches = (element, selector) => {
  const [tag, id] = selector.split('#')
  const tagOk = !tag || element.tagName === tag.toUpperCase()
  const idOk = !selector.includes('#') || element.id === id
  return element.isConnected && tagOk && idOk
}
globalThis.document = {
  createElement: tag => new Element(tag),
  querySelector: selector => [...elements].find(element => matches(element, selector)),
  querySelectorAll: selector => [...elements].filter(element => matches(element, selector)),
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
  const lost = loseContext.mock.callCount()
  if (state === 'destroyed') program.destroy()
  if (state === 'detached') canvas().remove()
  tick()
  assert.equal(gl.drawArrays.mock.callCount(), calls)
  assert.equal(frames.length, 0)
  assert.equal(loseContext.mock.callCount(), lost + 1)
  program.destroy()
}))

test('owned canvas style stays overrideable', async () => {
  await gradientGL('c1.915c')
  assert.equal(canvas().style.includes('!important'), false)
  assert.match(canvas().style, /z-index:-1/)
})

test('canvas query uses that canvas', async () => {
  const target = mount('gradient', 'canvas')
  await gradientGL('c1.915c', 'canvas#gradient')
  assert.equal(target.id, 'gradient')
  assert.equal(target.style, undefined)
  assert.equal(document.querySelectorAll('#gradient-gl').length, 0)
})

test('unsized canvas gets minimum size', async () => {
  const target = mount('gradient', 'canvas')
  target.clientWidth = 0
  target.clientHeight = 0
  target.style = { width: '', height: '' }
  await gradientGL('c1.915c', 'canvas#gradient')
  assert.equal(target.style.width, '100%')
  assert.equal(target.style.height, '100%')
  assert.equal(target.id, 'gradient')
})

test('resolution is set when the buffer already matches', async () => {
  const target = mount('gradient', 'canvas')
  target.width = target.clientWidth
  target.height = target.clientHeight
  await gradientGL('c1.915c', 'canvas#gradient')
  tick()
  const hit = gl.uniform3f.mock.calls.some(call =>
    call.arguments[1] === target.width && call.arguments[2] === target.height)
  assert.equal(hit, true)
})

test('caller canvas destroy keeps the live context', async () => {
  const target = mount('target', 'canvas')
  const program = await gradientGL('c1.915c', '#target')
  const lost = loseContext.mock.callCount()
  program.destroy()
  assert.equal(loseContext.mock.callCount(), lost)
  assert.ok(target.isConnected)
})
