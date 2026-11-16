// Taalmenu in de navigatie (<details data-lang-menu>): sluiten met Esc of een klik ernaast.
const menu = document.querySelector('[data-lang-menu]')
if (menu) {
  const summary = menu.querySelector('summary')
  document.addEventListener('click', event => {
    if (menu.open && !menu.contains(event.target)) menu.open = false
  })
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !menu.open) return
    const focusInside = menu.contains(document.activeElement)
    menu.open = false
    if (focusInside) summary.focus()
  })
}
