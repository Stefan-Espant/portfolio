// Sectiekopjes per letter (spec: Motion #3) en de bento: opbouwen, kantelen naar de muis en een
// lichtvlek onder de cursor (spec: Motion #4).

export function chars(gsap, SplitText) {
  // Alleen sectiekopjes, geen projecttitels in kaarten (die staan in een link).
  gsap.utils.toArray('h2.display').filter(title => !title.closest('a')).forEach(title => {
    const split = SplitText.create(title, { type: 'words,chars', mask: 'chars' })
    gsap.from(split.chars, {
      yPercent: 100,
      rotate: 6,
      duration: 0.7,
      stagger: 0.03,
      ease: 'back.out(1.8)',
      scrollTrigger: { trigger: title, start: 'top 85%', once: true },
      onComplete: () => split.revert()
    })
  })
}

export function bento(gsap, finePointer) {
  gsap.utils.toArray('[data-motion="bento"]').forEach(grid => {
    gsap.from(grid.children, {
      y: 60,
      rotateX: -12,
      transformPerspective: 900,
      autoAlpha: 0,
      duration: 1,
      stagger: 0.12,
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: grid, start: 'top 80%', once: true }
    })
  })
  if (!finePointer) return
  document.querySelectorAll('[data-motion="bento"] .project-card').forEach(card => tilt(gsap, card))
}

function tilt(gsap, card) {
  gsap.set(card, { transformPerspective: 900 })
  const rotateY = gsap.quickTo(card, 'rotationY', { duration: 0.4, ease: 'power2.out' })
  const rotateX = gsap.quickTo(card, 'rotationX', { duration: 0.4, ease: 'power2.out' })
  let box = null
  // Afmetingen één keer meten bij binnenkomst, niet bij elke beweging.
  card.addEventListener('pointerenter', () => { box = card.getBoundingClientRect() })
  card.addEventListener('pointermove', event => {
    if (!box) return
    const x = (event.clientX - box.left) / box.width
    const y = (event.clientY - box.top) / box.height
    card.style.setProperty('--cx', `${x * 100}%`)
    card.style.setProperty('--cy', `${y * 100}%`)
    rotateY((x - 0.5) * 10)
    rotateX((0.5 - y) * 10)
  }, { passive: true })
  card.addEventListener('pointerleave', () => {
    box = null
    gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)', overwrite: true })
  })
}
