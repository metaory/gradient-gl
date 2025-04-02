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

const query = document.querySelector.bind(document)
const getEl = document.getElementById.bind(document)
const getEls = document.querySelectorAll.bind(document)
const mkEl = (tag, props = {}, children = []) => {
    const el = document.createElement(tag)
    return pipe(
        el => setProps(el, props),
        el => appendChildren(el, children)
    )(el)
}

const state = {
    seed: '',
    update: () => {
        const shader = query('.shader[data-selected="true"]')?.dataset.shader
        const values = ['speed', 'hue', 'saturation', 'lightness']
            .map(id => query(id)?.value || '4')

        state.seed = shader ? `${shader}.${values.join('')}` : state.seed
        getEl('seed').textContent = state.seed
        gradient(state.seed)

        const disclaimer = getEl('info')
        const color = disclaimer.style.color
        disclaimer.style.color = 'var(--pk0)'
        setTimeout(() => { disclaimer.style.color = color }, 600)
    }
}

// UI Components
const createRangeInput = ({ id, label }) => mkEl('div', { className: 'control' }, [
    mkEl('label', { htmlFor: id, title: label, textContent: label[0].toUpperCase() }),
    mkEl('input', {
        type: 'range',
        id,
        title: label,
        min: 0,
        max: 9,
        value: 4,
        oninput: state.update
    })
])

const createShaderOption = shader => mkEl('button', {
    className: 'shader',
    textContent: shader,
    dataset: { shader },
    onclick: (e) => {
        const target = e.target
        for (const opt of getEls('.shader')) {
            opt.dataset.selected = opt === target ? 'true' : 'false'
        }
        state.update()
    }
})

if (!shaders?.length) {
    console.error('No shaders available')
}

// Create shader UI
const shadersByType = shaders.reduce((acc, shader) => {
    acc[shader[0]] = [...(acc[shader[0]] || []), shader]
    return acc
}, {})

getEl('shaders').append(
    ...Object.values(shadersByType).map(variations =>
        mkEl('div', { className: 'shader-type' },
            variations.map(createShaderOption)))
)

getEl('options').append(
    ...['speed', 'hue', 'saturation', 'lightness'].map(id =>
        createRangeInput({ id, label: id }))
)

const randomShader = shaders[0]
const initialOption = query(`.shader[data-shader="${randomShader}"]`)
if (initialOption) {
    initialOption.dataset.selected = 'true'
}

state.update()