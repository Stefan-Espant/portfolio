// Beweging voor de hele site (spec 2026-11-15, Motion: niveau 2). GSAP, ScrollTrigger en SplitText staan
// als defer-scripts in <head>; dit module-script draait daarna. Bij prefers-reduced-motion of als GSAP
// ontbreekt gebeurt er niets en blijft alles statisch zichtbaar. De pagina-overgang is puur CSS
// (View Transitions) en staat daarom niet hier.
import { intro } from './intro.js'
import { headings, rise } from './reveal.js'
import { hover } from './hover.js'
import { nav } from './nav.js'
import { marquee } from './marquee.js'
import { counts } from './count.js'
import { hscroll, timeline } from './scroll.js'

const root = document.documentElement
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const { gsap, ScrollTrigger, SplitText } = window

function stop() {
  root.classList.remove('motion')
}

if (reduced || !gsap || !ScrollTrigger || !SplitText) {
  stop()
} else {
  gsap.registerPlugin(ScrollTrigger, SplitText)
  ScrollTrigger.config({ ignoreMobileResize: true })
  const finePointer = window.matchMedia('(pointer: fine)').matches

  document.fonts.ready.then(() => {
    try {
      intro()
      nav(gsap)
      headings(gsap, SplitText)
      rise(gsap, ScrollTrigger)
      if (finePointer) hover(gsap)
      marquee(gsap, ScrollTrigger)
      counts(gsap)
      hscroll(gsap)
      timeline(gsap)
      ScrollTrigger.refresh()
    } catch (error) {
      // Een fout in een effect mag de inhoud nooit verborgen laten. Halverwege een effect kan inhoud op
      // opacity 0 staan: alles wat een effect verbergt terugzetten.
      gsap.set('[data-motion="intro"] > *, [data-motion="tiles"] > *, [data-motion="rise"] > *', { clearProps: 'all' })
      stop()
      console.error(error)
    } finally {
      window.__motionReady = true
    }
  }).catch(stop)
}
