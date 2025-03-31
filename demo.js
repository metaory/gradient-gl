import gradient from './index.js'
import shaders from './shaders/index.js'

// const rnd = (max) => (Math.random() * max) | 0

function rnd(k, v) {
  const p = (sessionStorage[k] || v).split`,`
  sessionStorage[k] = p.length > 1 ? p.slice(1).join() : v
  return p.at(0)
}

const shader = rnd('gl', shaders.join())
const hex = Date.now().toString(16).slice(-6)

const seed = `${shader}.${hex}`

console.log(seed, '<<<')

gradient(seed)

// gradient({ seed: 'w2.678' });
// gradient('w2.678');
