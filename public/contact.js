// Contactformulier → Centaur Forms (spec: Toegankelijkheid, Foutafhandeling). Bij een fout blijven
// de ingevulde waarden staan; de status staat in een aria-live-regio.
document.querySelectorAll('[data-contact-form]').forEach(function (root) {
  var form = root.querySelector('form')
  var button = form.querySelector('button[type=submit]')
  var status = root.querySelector('[data-contact-status]')
  var sending = false
  // Tijdscontrole: een mens heeft meer dan een paar seconden nodig om dit formulier in te vullen.
  var shownAt = Date.now()
  var MIN_MS = 3000
  form.hidden = false

  var succeed = function () {
    form.reset()
    status.textContent = root.dataset.success
    status.dataset.state = 'success'
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault()
    if (sending) return
    // Alleen-spaties mag niet door `required` komen.
    form.querySelectorAll('input, textarea').forEach(function (input) {
      if (input.name === 'naam' || input.name === 'email' || input.name === 'bericht') input.value = input.value.trim()
    })
    if (!form.reportValidity()) return
    var data = new FormData(form)
    var website = String(data.get('website') || '')
    // Waarschijnlijk een bot (honeypot ingevuld of veel te snel): doe alsof het gelukt is, verstuur niets.
    if (website || Date.now() - shownAt < MIN_MS) {
      succeed()
      return
    }
    var fields = {
      naam: String(data.get('naam') || '').trim(),
      email: String(data.get('email') || '').trim(),
      bericht: String(data.get('bericht') || '').trim(),
      // Altijd meesturen: Centaur controleert de honeypot ook zelf en slaat een leeg veld niet op.
      website: website
    }
    var signal = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(8000) : undefined
    sending = true
    button.setAttribute('aria-disabled', 'true')
    button.textContent = root.dataset.sending
    status.textContent = ''
    delete status.dataset.state

    fetch(root.dataset.apiBase.replace(/\/$/, '') + '/api/public/forms/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': root.dataset.tenant },
      body: JSON.stringify({ pageSlug: 'contact', formTitle: 'Contact portfolio', fields: fields }),
      signal: signal
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Status ' + response.status)
        succeed()
      })
      .catch(function () {
        status.textContent = root.dataset.error
        status.dataset.state = 'error'
      })
      .finally(function () {
        sending = false
        button.removeAttribute('aria-disabled')
        button.textContent = root.dataset.send
      })
  })
})
