// Binnenkomst (spec 2026-11-15, Motion: intro): de kopregels schuiven uit een masker omhoog, daarna
// faden de andere onderdelen van de kop in. Op de home schalen de bento-tegels in en zoomen de covers uit.
export function intro(gsap, SplitText) {
  const root = document.documentElement
  const hero = document.querySelector('[data-motion="intro"]')
  if (!hero) {
    root.classList.remove('motion')
    return
  }
  const title = hero.querySelector('h1')
  const rest = [...hero.children].filter(element => element !== title)
  const split = title ? SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'split-line' }) : null
  const tiles = gsap.utils.toArray('[data-motion="tiles"] > *')
  const covers = gsap.utils.toArray('[data-motion="tiles"] .project-card__img')

  // Beginstand zetten en dan pas zichtbaar maken: geen flits van de eindstand.
  gsap.set(rest, { autoAlpha: 0, y: 14 })
  if (tiles.length) gsap.set(tiles, { autoAlpha: 0, scale: 0.94 })
  root.classList.remove('motion')

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
  if (split) tl.from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.1, onComplete: () => split.revert() }, 0.1)
  tl.to(rest, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power2.out', clearProps: 'all' }, 0.45)
  if (tiles.length) {
    tl.to(tiles, { autoAlpha: 1, scale: 1, duration: 1.1, stagger: 0.07, clearProps: 'all' }, 0.6)
    tl.from(covers, { scale: 1.35, duration: 1.5, stagger: 0.07, clearProps: 'transform' }, 0.6)
  }
}
