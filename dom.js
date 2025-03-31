
export const createCanvas = (selector = 'body') => {
  const targetElement = document.querySelector(selector) ?? document.body
  return targetElement.tagName === 'CANVAS'
    ? targetElement
    : targetElement.appendChild(document.createElement('canvas'))
}
