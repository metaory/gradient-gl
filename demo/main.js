import gradient from '../index.js'
import shaders from '../shaders/index.js'

// Pure functions for DOM creation
const createRadio = (id, name, value) => {
    const radio = document.createElement('input')
    radio.type = 'radio'
    radio.id = id
    radio.name = name
    radio.value = value
    return radio
}

const createLabel = (htmlFor, text) => {
    const label = document.createElement('label')
    label.htmlFor = htmlFor
    label.textContent = text
    return label
}

// Create shader option with radio and label
const createShaderOption = (shader) => {
    const radio = createRadio(shader, 'shader', shader)
    const label = createLabel(shader, shader)
    return [radio, label]
}

// Create a row of shader options
const createShaderRow = (variations) => {
    const row = document.createElement('div')
    row.className = 'shader-type'
    for (const el of variations.flatMap(createShaderOption)) {
        row.appendChild(el)
    }
    return row
}

// Group shaders by type and create UI
const createShaderUI = (shaders) => {
    const container = document.getElementById('shader-options')

    // Group shaders by type
    const shadersByType = shaders.reduce((acc, shader) => {
        const type = shader[0]
        acc[type] = acc[type] || []
        acc[type].push(shader)
        return acc
    }, {})

    // Create and append rows
    for (const row of Object.values(shadersByType).map(createShaderRow)) {
        container.appendChild(row)
    }
}

// Create seed string from form values
const createSeedString = (shader, speed, hue, saturation, lightness) =>
    `${shader}.${speed}${hue}${saturation}${lightness}`

// Update seed display
const updateSeed = () => {
    const shader = document.querySelector('input[name="shader"]:checked').value
    const speed = document.getElementById('speed').value
    const hue = document.getElementById('hue').value
    const saturation = document.getElementById('saturation').value
    const lightness = document.getElementById('lightness').value

    document.getElementById('seed').textContent = createSeedString(shader, speed, hue, saturation, lightness)
}

// Initialize UI
const init = () => {
    createShaderUI(shaders)
    document.getElementById('a2').checked = true

    // Add event listeners to all inputs
    for (const input of document.querySelectorAll('input')) {
        input.addEventListener('input', updateSeed)
    }

    // Set initial seed
    const seed = 'a2.4873'
    document.getElementById('seed').textContent = seed
    gradient(seed)
}

// Start the application
init()

// gradient({ seed: 'w2.678' });
// gradient('w2.678');
