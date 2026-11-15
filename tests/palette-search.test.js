import { describe, expect, test } from 'vitest'
import { normalize, search } from '../public/palette/search.js'

const items = [
  { label: 'Werk', group: "Pagina's", href: '/werk' },
  { label: 'WaldJS', group: 'Projecten', href: '/werk/waldjs', keywords: 'framework typescript' },
  { label: 'Möhlen VOF', group: 'Projecten', href: '/werk/mohlen-vof' },
  { label: 'Over', group: "Pagina's", href: '/over' }
]

describe('palette search', () => {
  test('normalize negeert hoofdletters en accenten', () => {
    expect(normalize('Möhlen  VOF')).toBe('mohlen vof')
  })
  test('lege zoekterm geeft alles in de oorspronkelijke volgorde', () => {
    expect(search(items, '').map(item => item.href)).toEqual(['/werk', '/werk/waldjs', '/werk/mohlen-vof', '/over'])
  })
  test('begin van het label gaat voor, daarna een woord, daarna trefwoorden', () => {
    expect(search(items, 'w').map(item => item.href)).toEqual(['/werk', '/werk/waldjs'])
    expect(search(items, 'mohl').map(item => item.label)).toEqual(['Möhlen VOF'])
    expect(search(items, 'vof').map(item => item.label)).toEqual(['Möhlen VOF'])
    expect(search(items, 'typescript').map(item => item.label)).toEqual(['WaldJS'])
  })
  test('alle woorden moeten voorkomen', () => {
    expect(search(items, 'waldjs framework').map(item => item.label)).toEqual(['WaldJS'])
    expect(search(items, 'waldjs php')).toEqual([])
  })
})
