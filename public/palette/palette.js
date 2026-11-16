// Commandopalet: ⌘K / Ctrl+K of de zoekknop opent de <dialog>; typen filtert, ↑↓ kiest, Enter opent,
// Esc sluit (native dialog). ARIA-combobox met listbox; de actieve optie via aria-activedescendant.
import { search } from './search.js'

const dialog = document.querySelector('[data-palette]')
const indexEl = document.querySelector('[data-palette-index]')
const opener = document.querySelector('[data-palette-open]')

if (dialog && indexEl && typeof dialog.showModal === 'function') {
  const items = JSON.parse(indexEl.textContent || '[]')
  const input = dialog.querySelector('.palette__input')
  const list = dialog.querySelector('.palette__list')
  const empty = dialog.querySelector('[data-palette-empty]')
  let results = []
  let active = 0

  const render = () => {
    results = search(items, input.value)
    active = Math.min(active, Math.max(0, results.length - 1))
    list.replaceChildren()
    const groups = new Map()
    results.forEach((item, index) => {
      if (!groups.has(item.group)) {
        const group = document.createElement('li')
        group.setAttribute('role', 'group')
        group.setAttribute('aria-label', item.group)
        const heading = document.createElement('div')
        heading.className = 'palette__group'
        heading.setAttribute('aria-hidden', 'true')
        heading.textContent = item.group
        const options = document.createElement('ul')
        options.setAttribute('role', 'none')
        options.style.listStyle = 'none'
        group.append(heading, options)
        list.append(group)
        groups.set(item.group, options)
      }
      const option = document.createElement('li')
      option.id = `palette-option-${index}`
      option.className = 'palette__option'
      option.setAttribute('role', 'option')
      option.setAttribute('aria-selected', String(index === active))
      if (item.lang) option.lang = item.lang
      option.textContent = item.label
      const path = document.createElement('span')
      path.textContent = item.href
      path.setAttribute('aria-hidden', 'true')
      option.append(path)
      option.addEventListener('click', () => go(index))
      option.addEventListener('pointermove', () => { if (active !== index) { active = index; select() } })
      groups.get(item.group).append(option)
    })
    empty.hidden = results.length > 0
    select()
  }

  const select = () => {
    list.querySelectorAll('[role="option"]').forEach(option => option.setAttribute('aria-selected', String(option.id === `palette-option-${active}`)))
    const current = list.querySelector(`#palette-option-${active}`)
    if (current) {
      input.setAttribute('aria-activedescendant', current.id)
      current.scrollIntoView({ block: 'nearest' })
    } else {
      input.removeAttribute('aria-activedescendant')
    }
  }

  const go = index => {
    const item = results[index]
    if (!item) return
    dialog.close()
    location.href = item.href
  }

  const open = () => {
    if (dialog.open) return
    input.value = ''
    active = 0
    render()
    dialog.showModal()
    input.focus()
  }

  input.addEventListener('input', () => { active = 0; render() })
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!results.length) return
      active = (active + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length
      select()
    } else if (event.key === 'Enter') {
      event.preventDefault()
      go(active)
    }
  })
  // Klik op de achtergrond (buiten de doos) sluit.
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      dialog.open ? dialog.close() : open()
    }
  })
  if (opener) {
    opener.hidden = false
    opener.addEventListener('click', open)
  }
}
