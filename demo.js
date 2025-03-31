import gradient from "./index.js";
import shaders from './shaders/index.js'

const rnd = (max) => (Math.random() * max) | 0

const shader = shaders[rnd(shaders.length)]
const hex = Date.now().toString(16).slice(-6)

const seed = `${shader}.${hex}`

console.log(seed, '<<<')

gradient(seed)

// gradient({ seed: 'w2.678' });
// gradient('w2.678');
