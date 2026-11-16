// Onthullen bij scrollen (spec 2026-11-15, Motion: reveal): sectiekoppen per regel uit een masker,
// en kaarten in grids die opbouwen zodra ze in beeld komen.

export function headings(gsap, SplitText) {
  gsap.utils.toArray('[data-motion="reveal"]').forEach(title => {
    const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'split-line' })
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 1,
      stagger: 0.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: title, start: 'top 88%', once: true },
      onComplete: () => split.revert()
    })
  })
}

export function rise(gsap, ScrollTrigger) {
  gsap.utils.toArray('[data-motion="rise"]').forEach(group => {
    const items = [...group.children]
    if (!items.length) return
    gsap.set(items, { autoAlpha: 0, y: 30 })
    ScrollTrigger.batch(items, {
      start: 'top 92%',
      once: true,
      onEnter: batch => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.07, ease: 'expo.out', clearProps: 'all' })
    })
  })
}
