// Themaknop (spec 2026-11-15). Het inline script in <head> zet data-theme al vóór de eerste paint; dit
// script toont de knop (zonder JavaScript blijft hij verborgen) en onthoudt een eigen keuze. Zonder eigen
// keuze volgt de site de systeeminstelling, ook als die verandert terwijl de pagina open staat.
(function () {
  var root = document.documentElement
  var button = document.querySelector('[data-theme-toggle]')
  var system = window.matchMedia('(prefers-color-scheme: dark)')

  function stored() {
    try { return localStorage.getItem('theme') } catch (e) { return null }
  }
  function sync() {
    if (!button) return
    // Vast label ("Donker thema"); aria-pressed zegt of het aan staat.
    button.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'))
  }

  system.addEventListener('change', function (event) {
    if (stored()) return
    root.dataset.theme = event.matches ? 'dark' : 'light'
    sync()
  })

  if (!button) return
  button.hidden = false
  sync()
  button.addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'
    try { localStorage.setItem('theme', root.dataset.theme) } catch (e) { /* privémodus: alleen deze pagina */ }
    sync()
  })
})()
