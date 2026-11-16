import { describe, expect, test } from 'vitest'
import { activeSteps, counterLabel, formatCount, parseCount } from '../public/motion/utils.js'

describe('counterLabel', () => {
  test('geeft het huidige item van een strook, met voorloopnul', () => {
    expect(counterLabel(0, 5)).toBe('01')
    expect(counterLabel(0.45, 5)).toBe('03')
    expect(counterLabel(0.99, 5)).toBe('05')
    expect(counterLabel(1, 5)).toBe('05')
    expect(counterLabel(0.5, 12)).toBe('07')
  })
})

describe('activeSteps', () => {
  test('een stap gaat aan zodra de lijn zijn stip bereikt', () => {
    expect(activeSteps(0, 3)).toBe(1)
    expect(activeSteps(0.3, 3)).toBe(1)
    expect(activeSteps(0.44, 3)).toBe(2)
    expect(activeSteps(0.93, 3)).toBe(3)
    expect(activeSteps(1, 3)).toBe(3)
    expect(activeSteps(0.5, 1)).toBe(1)
    expect(activeSteps(0.5, 0)).toBe(0)
  })
})

describe('parseCount en formatCount', () => {
  test('herkent getallen met voor- en achtervoegsel en behoudt het decimaalteken', () => {
    expect(parseCount('100')).toEqual({ prefix: '', value: 100, decimals: 0, separator: '.', suffix: '' })
    expect(parseCount('0,4 s')).toEqual({ prefix: '', value: 0.4, decimals: 1, separator: ',', suffix: ' s' })
    expect(parseCount('± 2.5 KB')).toEqual({ prefix: '± ', value: 2.5, decimals: 1, separator: '.', suffix: ' KB' })
    expect(parseCount('100%')).toEqual({ prefix: '', value: 100, decimals: 0, separator: '.', suffix: '%' })
  })

  test('geeft null zonder getal', () => {
    expect(parseCount('veel')).toBeNull()
    expect(parseCount('')).toBeNull()
  })

  test('formatCount schrijft een tussenwaarde in hetzelfde formaat', () => {
    const parsed = parseCount('0,4 s')
    expect(formatCount(parsed, 0)).toBe('0,0 s')
    expect(formatCount(parsed, 0.25)).toBe('0,3 s')
    expect(formatCount(parseCount('100%'), 42.4)).toBe('42%')
  })
})
