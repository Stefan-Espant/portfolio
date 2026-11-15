// Hover op projectkaarten (spec 2026-11-15, Motion: hover): de cover zoomt in en er verschijnt een pijl.
// Alleen bij een fijne aanwijzer; toetsenbordfocus toont de pijl via CSS.
export function hover(gsap) {
  document.querySelectorAll('.project-card').forEach(card => {
    const cover = card.querySelector('.project-card__img, .project-card__art')
    const arrow = card.querySelector('.project-card__arrow')
    card.addEventListener('pointerenter', () => {
      if (cover) gsap.to(cover, { scale: 1.06, duration: 0.9, ease: 'expo.out', overwrite: 'auto' })
      if (arrow) gsap.to(arrow, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2)', overwrite: 'auto' })
    })
    card.addEventListener('pointerleave', () => {
      if (cover) gsap.to(cover, { scale: 1, duration: 0.9, ease: 'expo.out', overwrite: 'auto' })
      if (arrow) gsap.to(arrow, { autoAlpha: 0, scale: 0.6, rotate: -45, duration: 0.3, overwrite: 'auto' })
    })
  })
}
