// Cijfers op case studies tellen op zodra ze in beeld komen. Tekst zonder getal blijft staan.
import { formatCount, parseCount } from './utils.js'

export function counts(gsap) {
  document.querySelectorAll('[data-motion="count"]').forEach(element => {
    const original = element.textContent || ''
    const parsed = parseCount(original)
    if (!parsed) return
    const state = { value: 0 }
    gsap.to(state, {
      value: parsed.value,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 85%', once: true },
      onStart: () => { element.textContent = formatCount(parsed, 0) },
      onUpdate: () => { element.textContent = formatCount(parsed, state.value) },
      onComplete: () => { element.textContent = original }
    })
  })
}
