// Horizontale stroken (spec: Motion #6) en de tijdlijn op case studies. Alleen vanaf 48rem; daaronder
// blijven het de swipe-lijst en de verticale tijdlijn uit plan 2. gsap.matchMedia ruimt alles op als
// het scherm smaller wordt.
import { activeSteps, counterLabel } from './utils.js'

export function hscroll(gsap) {
  gsap.matchMedia().add('(min-width: 48rem)', () => {
    const pinned = []
    document.querySelectorAll('[data-motion="hscroll"]').forEach(section => {
      const track = section.querySelector('.hscroll__track')
      const bar = section.querySelector('.hscroll__progress i')
      const current = section.querySelector('[data-hscroll-current]')
      if (!track) return
      section.classList.add('is-pinned')
      const distance = () => Math.max(0, track.scrollWidth - section.clientWidth)
      // Past alles al naast elkaar, dan niet pinnen.
      if (distance() === 0) {
        section.classList.remove('is-pinned')
        return
      }
      pinned.push(section)
      const count = track.children.length
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: self => { if (current) current.textContent = counterLabel(self.progress, count) }
        }
      })
        .to(track, { x: () => -distance(), ease: 'none' }, 0)
        .fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
    })
    return () => pinned.forEach(section => section.classList.remove('is-pinned'))
  })
}

export function timeline(gsap) {
  gsap.matchMedia().add('(min-width: 48rem)', () => {
    const sections = [...document.querySelectorAll('[data-motion="timeline"]')]
    sections.forEach(section => {
      const body = section.querySelector('.timeline__body')
      const fill = section.querySelector('.timeline__line i')
      const steps = [...section.querySelectorAll('.timeline__step')]
      if (!body || !steps.length) return
      section.classList.add('is-horizontal')
      const distance = () => Math.max(0, body.scrollWidth - section.clientWidth)
      const setActive = progress => {
        const active = activeSteps(progress, steps.length)
        steps.forEach((step, index) => step.classList.toggle('is-active', index < active))
      }
      setActive(0)
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: self => setActive(self.progress)
        }
      })
        .to(body, { x: () => -distance(), ease: 'none' }, 0)
        .fromTo(fill, { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
    })
    return () => sections.forEach(section => {
      section.classList.remove('is-horizontal')
      section.querySelectorAll('.timeline__step').forEach(step => step.classList.remove('is-active'))
    })
  })
}
