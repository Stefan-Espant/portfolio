// Zoeken in het commandopalet (getest in tests/palette-search.test.js). Geen afhankelijkheden: draait in
// de browser en in Vitest.

/** Kleine letters, zonder accenten en met enkele spaties: "Möhlen  VOF" → "mohlen vof". */
export function normalize(text) {
  return String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Score per item: label begint met de term (3), een woord in het label begint ermee (2), ergens anders (1). */
function score(item, word) {
  const label = normalize(item.label)
  if (label.startsWith(word)) return 3
  if (label.split(' ').some(part => part.startsWith(word))) return 2
  if (normalize(`${item.label} ${item.group} ${item.keywords ?? ''}`).includes(word)) return 1
  return 0
}

/** Items waarin alle woorden van de zoekterm voorkomen, beste eerst; bij gelijke score de oorspronkelijke volgorde. */
export function search(items, query) {
  const words = normalize(query).split(' ').filter(Boolean)
  if (!words.length) return items.slice()
  return items
    .map((item, index) => ({ item, index, scores: words.map(word => score(item, word)) }))
    .filter(entry => entry.scores.every(Boolean))
    .sort((a, b) => b.scores.reduce((x, y) => x + y) - a.scores.reduce((x, y) => x + y) || a.index - b.index)
    .map(entry => entry.item)
}
