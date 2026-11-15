// Playground: toont de sectie (zonder JavaScript verborgen) en zet bij elke wijziging het resultaat van de
// mini-compiler in de sandbox-iframe (sandbox="" : geen scripts, geen toegang tot deze pagina).
import { compileWald } from './compile.js'

const section = document.querySelector('[data-playground]')
if (section) {
  const editor = section.querySelector('textarea')
  const preview = section.querySelector('[data-playground-preview]')
  const styles = getComputedStyle(document.documentElement)
  const token = name => styles.getPropertyValue(name).trim()
  const frame = body => `<!doctype html><html><head><meta charset="utf-8"><style>
    body { margin: 0; padding: 1.75rem; font: 16px/1.6 system-ui, sans-serif; color: ${token('--ink')}; background: ${token('--card')}; }
    h1 { margin: 0 0 .5rem; font-size: 2rem; letter-spacing: -.03em; line-height: 1.1; }
    ul { padding-left: 1.3rem; }
    .pg-error { color: #c62828; font-family: ui-monospace, monospace; }
  </style></head><body>${body}</body></html>`

  let timer
  const update = () => { preview.srcdoc = frame(compileWald(editor.value)) }
  editor.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(update, 120) })
  // Bij een themawissel de iframe opnieuw opbouwen; getComputedStyle is live, dus de nieuwe kleuren staan klaar.
  new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  section.hidden = false
  update()
}
