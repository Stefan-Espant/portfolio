// Pagina-overgang (spec: Motion #7): bij een interne link schuift een donker vlak met het saffraan logo
// omhoog; op de nieuwe pagina schuift het weer weg (het inline script in <head> zet `is-arriving`).
export function transitions(gsap) {
  const root = document.documentElement
  const wipe = document.querySelector('.wipe')
  if (!wipe) return
  const logo = wipe.querySelector('.wipe__logo')

  if (root.classList.contains('is-arriving')) {
    gsap.set(wipe, { scaleY: 1, transformOrigin: 'top' })
    gsap.set(logo, { autoAlpha: 1 })
    root.classList.remove('is-arriving')
    gsap.timeline()
      .to(logo, { autoAlpha: 0, duration: 0.2, delay: 0.1 })
      .to(wipe, { scaleY: 0, duration: 0.55, ease: 'power4.out' })
  }

  document.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null
    if (!link || event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if ((link.target && link.target !== '_self') || link.hasAttribute('download')) return
    const url = new URL(link.href, location.href)
    if (url.origin !== location.origin) return
    if (url.pathname === location.pathname && url.hash) return // anker op dezelfde pagina (o.a. de skip-link)
    if (/\.[a-z0-9]{2,5}$/i.test(url.pathname)) return // bestanden zoals de cv-pdf
    event.preventDefault()
    gsap.timeline({
      onComplete: () => {
        try { sessionStorage.setItem('wipe', '1') } catch { /* privémodus: dan zonder wipe-uit */ }
        location.href = url.href
      }
    })
      .set(wipe, { transformOrigin: 'bottom' })
      .to(wipe, { scaleY: 1, duration: 0.5, ease: 'power4.in' })
      .to(logo, { autoAlpha: 1, duration: 0.15 })
  })

  // Terug-knop (bfcache): de pagina komt terug zoals hij vertrok, dus de wipe opruimen.
  addEventListener('pageshow', event => {
    if (event.persisted) gsap.set([wipe, logo], { clearProps: 'all' })
  })
}
