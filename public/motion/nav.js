// Navigatie (spec 2026-11-15, Motion: nav): een indicator glijdt naar de link onder de muis of met
// toetsenbordfocus, en terug naar de huidige pagina. Zonder dit script markeert de huidige link zichzelf.
export function nav(gsap) {
  const menu = document.querySelector('[data-motion="nav"]')
  const indicator = menu?.querySelector('.nav__indicator')
  if (!menu || !indicator) return
  const links = [...menu.querySelectorAll('.nav__link')]
  const current = links.find(link => link.getAttribute('aria-current') === 'page') ?? null

  const moveTo = (link, instant = false) => {
    links.forEach(other => other.classList.toggle('is-under', other === link))
    if (!link) {
      gsap.to(indicator, { autoAlpha: 0, duration: 0.2, overwrite: 'auto' })
      return
    }
    gsap.to(indicator, { x: link.offsetLeft, width: link.offsetWidth, autoAlpha: 1, duration: instant ? 0 : 0.45, ease: 'expo.out', overwrite: 'auto' })
  }

  menu.classList.add('is-gliding')
  moveTo(current, true)
  links.forEach(link => {
    link.addEventListener('pointerenter', () => moveTo(link))
    link.addEventListener('focus', () => moveTo(link))
  })
  menu.addEventListener('pointerleave', () => moveTo(current))
  menu.addEventListener('focusout', event => { if (!menu.contains(event.relatedTarget)) moveTo(current) })
  // Fonts of schermbreedte kunnen de links verschuiven.
  addEventListener('resize', () => moveTo(current, true), { passive: true })
}
