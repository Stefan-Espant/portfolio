// Contactformulier → Centaur Forms (spec: Toegankelijkheid, Foutafhandeling). Bij een fout blijven
// de ingevulde waarden staan; de status staat in een aria-live-regio.
document.querySelectorAll('[data-contact-form]').forEach(function (root) {
  var form = root.querySelector('form')
  var button = form.querySelector('button[type=submit]')
  var status = root.querySelector('[data-contact-status]')
  var sending = false
  form.hidden = false

  form.addEventListener('submit', function (event) {
    event.preventDefault()
    if (sending || !form.reportValidity()) return
    var data = new FormData(form)
    var fields = {
      naam: String(data.get('naam') || '').trim(),
      email: String(data.get('email') || '').trim(),
      bericht: String(data.get('bericht') || '').trim()
    }
    sending = true
    button.disabled = true
    button.textContent = root.dataset.sending
    status.textContent = ''
    delete status.dataset.state

    fetch(root.dataset.apiBase.replace(/\/$/, '') + '/api/public/forms/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': root.dataset.tenant },
      body: JSON.stringify({ pageSlug: 'contact', formTitle: 'Contact portfolio', fields: fields }),
      signal: AbortSignal.timeout(8000)
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Status ' + response.status)
        form.reset()
        status.textContent = root.dataset.success
        status.dataset.state = 'success'
      })
      .catch(function () {
        status.textContent = root.dataset.error
        status.dataset.state = 'error'
      })
      .finally(function () {
        sending = false
        button.disabled = false
        button.textContent = root.dataset.send
      })
  })
})
