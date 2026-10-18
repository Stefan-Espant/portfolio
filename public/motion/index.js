// Beweging voor de hele site (spec: Motion). GSAP, ScrollTrigger en SplitText staan als defer-scripts
// in <head>; dit module-script draait daarna. Bij prefers-reduced-motion of als GSAP ontbreekt
// gebeurt er niets en blijft alles statisch zichtbaar.
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
    window.__motionReady = true
    // Effecten worden in de volgende taken hier aangeroepen.
    ScrollTrigger.refresh()
  }).catch(stop)
}
