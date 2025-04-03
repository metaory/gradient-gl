// clamp v between [0, 9] and scale to [0, 255]
const normalize = (v) => Math.round(Math.max(0, Math.min(v, 9)) * (255 / 9))


export default (s) => [
  s.split('.').shift(),
  new Uint8Array(s.split('.').pop().split('').map(normalize)),
]
