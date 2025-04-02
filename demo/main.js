import gradient from '../index.js'
import shaders from '../shaders/index.js'

const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x)
const setDataset = (el, dataset) => {
    if (!dataset) return el
    for (const [k, v] of Object.entries(dataset)) {
        el.dataset[k] = v
    }
    return el
}
const setProps = (el, props) => {
    if (!props) return el
    for (const [k, v] of Object.entries(props)) {
        if (k === 'dataset') {
            setDataset(el, v)
        } else {
            el[k] = v
        }
    }
    return el
}
const appendChildren = (el, children) => {
    if (!children?.length) return el
    for (const child of children) el.append(child)
    return el
}
const getEl = id => document.getElementById(id)
const createEl = (tag, props = {}, children = []) => {
    const el = document.createElement(tag)
    return pipe(
        el => setProps(el, props),
        el => appendChildren(el, children)
    )(el)
}

// State management
const state = {
    seed: '',
    update: () => {
        const shader = document.querySelector('.shader-option[data-selected="true"]')?.dataset.shader
        const values = ['speed', 'hue', 'saturation', 'lightness']
            .map(id => getEl(id)?.value || '4')

        state.seed = shader ? `${shader}.${values.join('')}` : state.seed
        getEl('seed').textContent = state.seed
        gradient(state.seed)

        // Visual feedback
        const disclaimer = getEl('disclaimer')
        const color = disclaimer.style.color
        disclaimer.style.color = 'var(--pk0)'
        setTimeout(() => { disclaimer.style.color = color }, 600)
    }
}

// UI Components
const createRangeInput = ({ id, label }) => createEl('div', { className: 'control' }, [
    createEl('label', { htmlFor: id, title: label, textContent: label[0].toUpperCase() }),
    createEl('input', {
        type: 'range',
        id,
        title: label,
        min: 0,
        max: 9,
        value: 4,
        oninput: state.update
    })
])

const createShaderOption = shader => createEl('button', {
    className: 'shader-option',
    textContent: shader,
    dataset: { shader },
    onclick: (e) => {
        const target = e.target
        const options = document.querySelectorAll('.shader-option')
        for (const opt of options) {
            opt.dataset.selected = opt === target ? 'true' : 'false'
        }
        state.update()
    }
})

if (!shaders?.length) {
    console.error('No shaders available')
    process.exit(1)
}

// Create shader UI
const shadersByType = shaders.reduce((acc, shader) => {
    acc[shader[0]] = [...(acc[shader[0]] || []), shader]
    return acc
}, {})

document.getElementById('shader-options').append(
    ...Object.values(shadersByType).map(variations =>
        createEl('div', { className: 'shader-type' },
            variations.map(createShaderOption)))
)

// Create range controls
document.getElementById('range-controls').append(
    ...['speed', 'hue', 'saturation', 'lightness'].map(id =>
        createRangeInput({ id, label: id }))
)

// Set initial state
const randomShader = (sessionStorage.gl || shaders.join()).split(',')[0]
const initialOption = document.querySelector(`.shader-option[data-shader="${randomShader}"]`)
if (initialOption) {
    initialOption.dataset.selected = 'true'
}
state.update()

// gradient({ seed: 'w2.678' });
// gradient('w2.678');
