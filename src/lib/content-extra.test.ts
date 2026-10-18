import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('./cms', () => ({ getCollection: vi.fn() }))

import { getCollection, type CentaurEntry } from './cms'
import {
  clearContentCache,
  getClients,
  getOtherProjects,
  getProjects,
  getStatus,
  parseMetrics,
  toClient,
  toProject,
  toStatus
} from './content'

const entry = (id: string, data: Record<string, unknown>): CentaurEntry => ({
  id, data, status: 'published', publishedAt: null, createdAt: '', updatedAt: ''
})

describe('parseMetrics', () => {
  test('één cijfer per regel, "Label: waarde"', () => {
    expect(parseMetrics('Lighthouse: 100\nLaadtijd: 0,4 s\n\nkapot\n: leeg')).toEqual([
      { label: 'Lighthouse', value: '100' },
      { label: 'Laadtijd', value: '0,4 s' }
    ])
    expect(parseMetrics(undefined)).toEqual([])
  })

  test('toProject leest metrics', () => {
    const project = toProject(entry('p', { locale: 'nl', translation_key: 'w', slug: 'w', title: 'W', metrics: 'JS: 0 KB' }))
    expect(project?.metrics).toEqual([{ label: 'JS', value: '0 KB' }])
  })
})

describe('toStatus en toClient', () => {
  test('status', () => {
    expect(toStatus(entry('s', { locale: 'nl', translation_key: 'status', available: true, text: 'Beschikbaar vanaf januari' }))).toEqual({
      id: 's', locale: 'nl', translationKey: 'status', slug: '', available: true, text: 'Beschikbaar vanaf januari'
    })
    expect(toStatus(entry('s', { locale: 'nl', translation_key: 'status', text: '' }))).toBeNull()
  })

  test('klant', () => {
    expect(toClient(entry('k', { locale: 'en', translation_key: 'fdnd', name: 'FDND', logo: 'https://cdn/x.svg', url: 'https://fdnd.nl', quote: 'Goed', quote_author: 'Koop', order: 2 }))).toEqual({
      id: 'k', locale: 'en', translationKey: 'fdnd', slug: '', name: 'FDND', logo: 'https://cdn/x.svg', url: 'https://fdnd.nl', quote: 'Goed', quoteAuthor: 'Koop', order: 2
    })
    expect(toClient(entry('k', { locale: 'en', translation_key: 'x', name: '' }))).toBeNull()
  })
})

describe('loaders', () => {
  const collections: Record<string, CentaurEntry[]> = {
    projecten: [
      entry('a', { locale: 'nl', translation_key: 'a', slug: 'dubbel', title: 'Eerste', featured: true, order: 1 }),
      entry('b', { locale: 'nl', translation_key: 'b', slug: 'dubbel', title: 'Tweede' }),
      entry('c', { locale: 'nl', translation_key: 'c', slug: 'oud', title: 'Oud', year: 2023 })
    ],
    status: [
      entry('s1', { locale: 'nl', translation_key: 'status', available: true, text: 'Beschikbaar' }),
      entry('s2', { locale: 'en', translation_key: 'status', available: false, text: 'Fully booked' })
    ],
    klanten: [
      entry('k1', { locale: 'nl', translation_key: 'z', name: 'Zeta', order: 2 }),
      entry('k2', { locale: 'nl', translation_key: 'a', name: 'Alfa', order: 1 }),
      entry('k3', { locale: 'nl', translation_key: 'm', name: 'Mid' })
    ]
  }

  beforeEach(() => {
    clearContentCache()
    vi.mocked(getCollection).mockClear()
    vi.mocked(getCollection).mockImplementation(async slug => collections[slug] ?? [])
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  test('dubbele slug per taal: alleen de eerste blijft, met een waarschuwing', async () => {
    expect((await getProjects('nl')).map(p => p.id)).toEqual(['a', 'c'])
    expect(console.warn).toHaveBeenCalledWith('⚠ projecten: slug "dubbel" (nl) komt meerdere keren voor; entry b wordt overgeslagen')
  })

  test('getOtherProjects: alles behalve uitgelicht', async () => {
    expect((await getOtherProjects('nl')).map(p => p.id)).toEqual(['c'])
  })

  test('getStatus per taal, of null', async () => {
    expect((await getStatus('en'))?.text).toBe('Fully booked')
    collections.status = []
    clearContentCache()
    expect(await getStatus('nl')).toBeNull()
  })

  test('getClients: op volgorde, zonder volgorde achteraan', async () => {
    expect((await getClients('nl')).map(c => c.name)).toEqual(['Alfa', 'Zeta', 'Mid'])
  })
})
