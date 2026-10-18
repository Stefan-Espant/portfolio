// Home-intro (spec: Motion #1): de kopregels schuiven uit een masker omhoog terwijl Fraunces van dun
// naar vet groeit, het logo-verloop veegt erdoorheen, de steen zoomt rustig in en de lead fadet in.
export function intro(gsap, SplitText) {
  const root = document.documentElement
  const hero = document.querySelector('[data-motion="intro"]')
  const logo = document.querySelector('.nav__home')
  const styles = getComputedStyle(root)
  const accent = styles.getPropertyValue('--accent').trim()
  const accent2 = styles.getPropertyValue('--accent-2').trim()
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

  tl.from('.stone', { scale: 1.08, duration: 1.6, ease: 'power2.out' }, 0)
  if (logo) {
    tl.fromTo(logo,
      { backgroundImage: `linear-gradient(90deg, ${accent}, #fff3cf, ${accent2})`, backgroundSize: '200% 100%', backgroundPosition: '100% 0' },
      { backgroundPosition: '0% 0', duration: 1.8, ease: 'power2.inOut', clearProps: 'backgroundImage,backgroundSize,backgroundPosition' }, 0.1)
  }

  if (!hero) {
    root.classList.remove('motion')
    return
  }
  const title = hero.querySelector('h1')
  const rest = [...hero.children].filter(element => element !== title)
  const split = title ? SplitText.create(title, { type: 'lines', mask: 'lines' }) : null
  // Beginstand zetten en dan pas zichtbaar maken: geen flits van de eindstand.
  gsap.set(rest, { autoAlpha: 0, y: 20 })
  root.classList.remove('motion')

  if (split) {
    tl.from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.12, onComplete: () => split.revert() }, 0.2)
      .fromTo(title,
        { fontVariationSettings: "'opsz' 144, 'wght' 300" },
        { fontVariationSettings: "'opsz' 144, 'wght' 700", duration: 1.6, ease: 'power3.out', clearProps: 'fontVariationSettings' }, 0.3)
  }
  tl.to(rest, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12, clearProps: 'all' }, 0.7)
}
