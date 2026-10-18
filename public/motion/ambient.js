// Parallax op de steen en de lichtbundel die de muis volgt (spec: Motion #2).

export function parallax(gsap) {
  gsap.to('[data-motion="parallax"]', {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: true }
  })
}

export function torch(gsap) {
  const element = document.querySelector('.torch')
  if (!element) return
  gsap.set(element, { x: innerWidth / 2, y: innerHeight * 0.4, autoAlpha: 1 })
  // quickTo: één doorlopende tween per as, geen nieuwe tween per muisbeweging.
  const moveX = gsap.quickTo(element, 'x', { duration: 0.6, ease: 'power3' })
  const moveY = gsap.quickTo(element, 'y', { duration: 0.6, ease: 'power3' })
  addEventListener('pointermove', event => {
    moveX(event.clientX)
    moveY(event.clientY)
  }, { passive: true })
}
