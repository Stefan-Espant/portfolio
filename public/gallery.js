// Lightbox voor Gallery.wald. Zonder dit script openen de links gewoon de afbeelding.
// Klik opent een native <dialog>; ← → en swipen bladeren, Esc of een klik naast het beeld sluit,
// en de focus gaat terug naar de link waarmee je hem opende.
for (const gallery of document.querySelectorAll('[data-gallery]')) {
  const dialog = gallery.querySelector('[data-lightbox]')
  const dataEl = gallery.querySelector('[data-gallery-images]')
  if (!dialog || !dataEl || typeof dialog.showModal !== 'function') continue

  const images = JSON.parse(dataEl.textContent || '[]')
  const img = dialog.querySelector('[data-lightbox-img]')
  const caption = dialog.querySelector('[data-lightbox-caption]')
  const count = dialog.querySelector('[data-lightbox-count]')
  const prev = dialog.querySelector('[data-lightbox-prev]')
  const next = dialog.querySelector('[data-lightbox-next]')
  let current = 0
  let opener = null

  const show = index => {
    current = (index + images.length) % images.length
    const image = images[current]
    img.src = image.src
    img.alt = image.alt || ''
    caption.textContent = image.alt || ''
    count.textContent = `${current + 1} / ${images.length}`
    // Buurbeelden alvast laden, dan bladert het zonder wachten.
    for (const offset of [1, -1]) new Image().src = images[(current + offset + images.length) % images.length].src
  }

  const single = images.length < 2
  prev.hidden = single
  next.hidden = single

  gallery.addEventListener('click', event => {
    const link = event.target.closest('[data-gallery-index]')
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    opener = link
    show(Number(link.dataset.galleryIndex))
    dialog.showModal()
  })

  prev.addEventListener('click', () => show(current - 1))
  next.addEventListener('click', () => show(current + 1))
  dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close())

  dialog.addEventListener('keydown', event => {
    if (single) return
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1) }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1) }
  })

  // Klik op de achtergrond (niet op het beeld of een knop) sluit.
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.classList.contains('lightbox__figure')) dialog.close()
  })

  let startX = null
  dialog.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') startX = event.clientX })
  dialog.addEventListener('pointerup', event => {
    if (startX === null || single) return
    const delta = event.clientX - startX
    startX = null
    if (Math.abs(delta) > 50) show(current + (delta < 0 ? 1 : -1))
  })

  dialog.addEventListener('close', () => {
    img.src = 'data:,'
    opener?.focus()
  })
}
