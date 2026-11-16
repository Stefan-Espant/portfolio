// Typefilter op /werk (spec: Sitemap). Zonder JavaScript blijven de knoppen verborgen en staat
// de volledige lijst er.
document.querySelectorAll('[data-filter]').forEach(function (group) {
  var items = document.querySelectorAll('[data-filter-item]')
  var status = document.querySelector('[data-filter-status]')
  group.hidden = false
  group.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-value]')
    if (!button) return
    group.querySelectorAll('button').forEach(function (other) {
      other.setAttribute('aria-pressed', String(other === button))
    })
    var shown = 0
    items.forEach(function (item) {
      var show = button.dataset.value === 'all' || item.dataset.type === button.dataset.value
      item.hidden = !show
      if (show) shown++
    })
    if (status) status.textContent = status.dataset.template.replace('{n}', String(shown))
  })
})
