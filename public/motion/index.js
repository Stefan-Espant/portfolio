// Beweging voor de hele site (spec: Motion). GSAP, ScrollTrigger en SplitText staan als defer-scripts
// in <head>; dit module-script draait daarna. Bij prefers-reduced-motion of als GSAP ontbreekt
// gebeurt er niets en blijft alles statisch zichtbaar.
import { intro } from './intro.js'
import { parallax, torch } from './ambient.js'
import { bento, chars } from './reveal.js'
import { marquee } from './marquee.js'
import { counts } from './count.js'

const root = document.documentElement
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const { gsap, ScrollTrigger, SplitText } = window

function stop() {
  root.classList.remove('motion', 'is-arriving')
}

if (reduced || !gsap || !ScrollTrigger || !SplitText) {
  stop()
} else {
  gsap.registerPlugin(ScrollTrigger, SplitText)
  ScrollTrigger.config({ ignoreMobileResize: true })
  const finePointer = window.matchMedia('(pointer: fine)').matches

  document.fonts.ready.then(() => {
    try {
      intro(gsap, SplitText)
      parallax(gsap)
      if (finePointer) torch(gsap)
      chars(gsap, SplitText)
      bento(gsap, finePointer)
      marquee(gsap, ScrollTrigger)
      counts(gsap)
      // Effecten worden in de volgende taken hier aangeroepen.
      ScrollTrigger.refresh()
    } catch (error) {
      // Een fout in een effect mag de inhoud nooit verborgen laten.
      stop()
      console.error(error)
    } finally {
      window.__motionReady = true
    }
  }).catch(stop)
}
