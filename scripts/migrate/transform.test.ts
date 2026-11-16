import { describe, expect, test } from 'vitest'
import { articleToEntry, projectToEntry, slugify } from './transform'

describe('slugify', () => {
  test('kleine letters, zonder accenten, koppeltekens', () => {
    expect(slugify('Café de Flore — Redesign!')).toBe('cafe-de-flore-redesign')
    expect(slugify('  Tulp Talk  ')).toBe('tulp-talk')
  })
})

describe('projectToEntry', () => {
  test('zet een DatoCMS-project om naar een NL-concept voor Centaur', () => {
    expect(projectToEntry({
      id: '1',
      heading: 'Tulp Talk',
      client: 'FDND',
      date: '2024-03-15',
      url: 'https://tulp.example',
      urlDesign: 'https://figma.com/file/x',
      image: [{ url: 'https://dato.example/tulp.png', alt: '' }]
    }, 'https://centaur.example/media/tulp.png')).toEqual({
      locale: 'nl',
      translation_key: 'tulp-talk',
      slug: 'tulp-talk',
      title: 'Tulp Talk',
      type: 'school',
      featured: false,
      order: 100,
      year: 2024,
      client: 'FDND',
      cover: 'https://centaur.example/media/tulp.png',
      cover_alt: 'Tulp Talk',
      live_url: 'https://tulp.example',
      design_url: 'https://figma.com/file/x'
    })
  })

  test('laat lege velden weg', () => {
    const entry = projectToEntry({ id: '2', heading: 'Leeg', client: null, date: null, url: null, urlDesign: null, image: null }, '')
    expect(entry).toEqual({
      locale: 'nl', translation_key: 'leeg', slug: 'leeg', title: 'Leeg', type: 'school', featured: false, order: 100, cover_alt: 'Leeg'
    })
  })
})

describe('articleToEntry', () => {
  test('zet markdown om naar HTML en maakt een intro', () => {
    const entry = articleToEntry({
      id: '9',
      title: 'Mijn eerste post',
      datum: '2024-02-01',
      paragraaf: 'Hallo **wereld**.\n\nTweede alinea.',
      _createdAt: '2024-02-03T10:00:00Z'
    })
    expect(entry).toEqual({
      locale: 'nl',
      translation_key: 'mijn-eerste-post',
      slug: 'mijn-eerste-post',
      title: 'Mijn eerste post',
      excerpt: 'Hallo wereld. Tweede alinea.',
      body: '<p>Hallo <strong>wereld</strong>.</p>\n<p>Tweede alinea.</p>\n',
      published_at: '2024-02-01'
    })
  })

  test('valt terug op _createdAt en kort lange intro’s af op een woordgrens', () => {
    const entry = articleToEntry({ id: '10', title: 'Lang', datum: null, paragraaf: 'woord '.repeat(60), _createdAt: '2023-11-20T08:00:00Z' })
    expect(entry.published_at).toBe('2023-11-20')
    expect(String(entry.excerpt).length).toBeLessThanOrEqual(160)
    expect(String(entry.excerpt).endsWith('woord…')).toBe(true)
  })

  test('kapt een lange intro zonder spaties op 160 tekens af', () => {
    const entry = articleToEntry({ id: '11', title: 'Url', datum: '2024-01-01', paragraaf: 'x'.repeat(300), _createdAt: '2024-01-01T00:00:00Z' })
    expect(String(entry.excerpt).length).toBe(160)
    expect(String(entry.excerpt).endsWith('…')).toBe(true)
  })

  test('decodeert HTML-entiteiten in de intro', () => {
    const entry = articleToEntry({ id: '12', title: 'Entiteiten', datum: '2024-01-01', paragraaf: 'Tom & Jerry say "hi"', _createdAt: '2024-01-01T00:00:00Z' })
    expect(entry.excerpt).toBe('Tom & Jerry say "hi"')
  })

  test('gooit een fout als de titel geen slug oplevert', () => {
    expect(() => articleToEntry({ id: '13', title: '!!!', datum: null, paragraaf: null, _createdAt: '2024-01-01T00:00:00Z' })).toThrow()
  })
})

describe('projectToEntry slug-fout', () => {
  test('gooit een fout als de heading geen slug oplevert', () => {
    expect(() => projectToEntry({ id: '3', heading: '!!!', client: null, date: null, url: null, urlDesign: null, image: null }, '')).toThrow()
  })
})

describe('trimmen van titels', () => {
  test('projectToEntry trimt heading en client', () => {
    const entry = projectToEntry({ id: '4', heading: 'Alweer ', client: ' Geen ', date: null, url: null, urlDesign: null, image: null }, '')
    expect(entry.title).toBe('Alweer')
    expect(entry.client).toBe('Geen')
    expect(entry.cover_alt).toBe('Alweer')
  })

  test('articleToEntry trimt de titel', () => {
    expect(articleToEntry({ id: '5', title: '  Hallo  ', datum: null, paragraaf: 'x', _createdAt: '2024-01-01T00:00:00Z' }).title).toBe('Hallo')
  })
})

describe('cover_alt uit eerste afbeelding', () => {
  test('gebruikt de alt van image[0]', () => {
    const entry = projectToEntry({ id: '6', heading: 'Tulp', client: null, date: null, url: null, urlDesign: null, image: [{ url: 'https://dato.example/a.png', alt: 'Een tulp' }] }, 'https://c.example/a.png')
    expect(entry.cover_alt).toBe('Een tulp')
  })
})
