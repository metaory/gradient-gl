import gradientGL from 'gradient-gl'
import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

await gradientGL('a2.ef55')

document.querySelector('#app').innerHTML = `
  <main>
    <a id="gradient-gl-logo" href="https://github.com/metaory/gradient-gl" target="_blank">
        <img src="https://raw.githubusercontent.com/metaory/gradient-gl/refs/heads/master/docs/public/logo.png"
            width="200"
            alt="logo" />
    </a>
    <div>
        <a href="https://vite.dev" target="_blank">
            <img src="${viteLogo}" class="logo" alt="Vite logo" />
        </a>
        <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
            <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
        </a>
        <h2>Hello gradient-gl</h2>
        <h3>from vite-vanilla</h3>
        <div class="card">
            <button id="counter" type="button"></button>
        </div>
        <p class="read-the-docs">
            Click on the Gradient GL logo to learn more
        </p>
    </div>
  </main>
`

setupCounter(document.querySelector('#counter'))
