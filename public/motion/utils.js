// Pure rekenhulpjes voor de animaties (getest in tests/motion-utils.test.js).

/** Teller van een horizontale strook: welk item nu in beeld is, als "01", "02", … */
export function counterLabel(progress, count) {
  const index = Math.min(count, Math.max(1, Math.floor(progress * count) + 1))
  return String(index).padStart(2, '0')
}

/** Hoeveel tijdlijnstappen actief zijn: een stap gaat aan zodra de lijn zijn stip bereikt. */
export function activeSteps(progress, count) {
  if (count <= 1) return count
  return Math.min(count, Math.floor(progress * (count - 1) + 0.15) + 1)
}

/** "0,4 s" → { prefix: '', value: 0.4, decimals: 1, separator: ',', suffix: ' s' }; null zonder getal. */
export function parseCount(text) {
  const match = String(text).trim().match(/^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/)
  if (!match) return null
  const [, prefix, number, suffix] = match
  const separator = number.includes(',') ? ',' : '.'
  const fraction = number.split(/[.,]/)[1]
  return { prefix, value: parseFloat(number.replace(',', '.')), decimals: fraction ? fraction.length : 0, separator, suffix }
}

/** Een tussenwaarde in hetzelfde formaat als het origineel. */
export function formatCount(parsed, value) {
  return parsed.prefix + value.toFixed(parsed.decimals).replace('.', parsed.separator) + parsed.suffix
}
