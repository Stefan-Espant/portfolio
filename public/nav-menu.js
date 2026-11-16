// Mobiel menu (Nav.wald): de knop "Menu" opent een <dialog> over het hele scherm. Native dialog: focus
// blijft erin, Esc sluit. Thema en zoeken in de overlay gebruiken de bestaande knoppen in de navigatie.
const overlay = document.querySelector('[data-nav-overlay]')
const opener = document.querySelector('[data-nav-open]')
if (overlay && opener && typeof overlay.showModal === 'function') {
  const close = () => overlay.open && overlay.close()

  opener.addEventListener('click', () => {
    overlay.showModal()
    overlay.querySelector('.nav__big-link')?.focus()
  })
  overlay.querySelector('[data-nav-close]')?.addEventListener('click', close)
  overlay.addEventListener('close', () => opener.focus())

  // Thema: dezelfde knop als op desktop (theme.js), zodat keuze en opslag op één plek blijven.
  overlay.querySelector('[data-nav-theme]')?.addEventListener('click', () => {
    document.querySelector('[data-theme-toggle]')?.click()
  })
  // Zoeken: eerst het menu dicht, dan het commandopalet (palette.js) openen.
  overlay.querySelector('[data-nav-search]')?.addEventListener('click', () => {
    close()
    document.querySelector('[data-palette-open]')?.click()
  })

  // Naar desktopbreedte gedraaid of geresized: het menu hoort dan niet meer open te staan.
  matchMedia('(min-width: 48rem)').addEventListener('change', event => { if (event.matches) close() })
  // Terug via de browserknop (bfcache): niet met een open menu binnenkomen.
  addEventListener('pageshow', close)
}
