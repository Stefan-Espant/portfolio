import { describe, expect, test } from 'vitest'
import type { CentaurEntry } from './cms'
import { forLocale, missingTranslations, toExperience, toPost, toProject, readingMinutes, toSkill, transitionName, translationsOf } from './content'

const entry = (data: Record<string, unknown>, id = 'e1'): CentaurEntry => ({
  id,
  data,
  status: 'published',
  publishedAt: '2026-10-01T00:00:00Z',
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-02T00:00:00Z'
})

const waldNl = {
  locale: 'nl',
  translation_key: 'waldjs',
  slug: 'waldjs',
  title: 'WaldJS',
  summary: 'Static-first framework.',
  type: 'framework',
  featured: true,
  order: 1,
  year: 2026,
  stack: 'TypeScript, Vite , Node',
  cover: 'https://cdn.example/wald.png',
  problem: '<p>Probleem</p>',
  approach: '<p>Aanpak</p>',
  result: '<p>Resultaat</p>',
  gallery: [{ image: 'https://cdn.example/1.png', alt: 'Eén' }, { image: '', alt: 'leeg' }],
  live_url: 'https://waldjs.eu',
  repo_url: 'https://github.com/Stefan-Espant/WaldJS',
  npm_package: '@waldjs/cli'
}

describe('toProject', () => {
  test('mapt alle velden naar camelCase', () => {
    expect(toProject(entry(waldNl))).toEqual({
      id: 'e1',
      locale: 'nl',
      translationKey: 'waldjs',
      slug: 'waldjs',
      title: 'WaldJS',
      summary: 'Static-first framework.',
      type: 'framework',
      featured: true,
      order: 1,
      year: 2026,
      client: '',
      stack: ['TypeScript', 'Vite', 'Node'],
      cover: 'https://cdn.example/wald.png',
      coverAlt: 'WaldJS',
      problemHtml: '<p>Probleem</p>',
      approachHtml: '<p>Aanpak</p>',
      resultHtml: '<p>Resultaat</p>',
      gallery: [{ src: 'https://cdn.example/1.png', alt: 'Eén' }],
      liveUrl: 'https://waldjs.eu',
      repoUrl: 'https://github.com/Stefan-Espant/WaldJS',
      designUrl: '',
      npmPackage: '@waldjs/cli',
      metrics: []
    })
  })

  test('valt terug op type "website" bij een onbekend type', () => {
    expect(toProject(entry({ ...waldNl, type: 'iets' }))?.type).toBe('website')
  })

  test('geeft null zonder locale, translation_key, slug of titel', () => {
    expect(toProject(entry({ ...waldNl, locale: 'de' }))).toBeNull()
    expect(toProject(entry({ ...waldNl, translation_key: '' }))).toBeNull()
    expect(toProject(entry({ ...waldNl, slug: '' }))).toBeNull()
    expect(toProject(entry({ ...waldNl, title: '  ' }))).toBeNull()
  })
})

describe('toPost', () => {
  test('mapt een blogpost', () => {
    expect(toPost(entry({
      locale: 'en',
      translation_key: 'hallo',
      slug: 'hello',
      title: 'Hello',
      excerpt: 'Kort.',
      body: '<p>Body</p>',
      published_at: '2024-05-01',
      tags: 'css, a11y'
    }))).toEqual({
      id: 'e1',
      locale: 'en',
      translationKey: 'hallo',
      slug: 'hello',
      title: 'Hello',
      excerpt: 'Kort.',
      bodyHtml: '<p>Body</p>',
      cover: '',
      coverAlt: 'Hello',
      publishedAt: '2024-05-01',
      tags: ['css', 'a11y']
    })
  })

  test('geeft null zonder slug of titel', () => {
    expect(toPost(entry({ locale: 'nl', translation_key: 'x', slug: '', title: 'X' }))).toBeNull()
  })
})

describe('toExperience', () => {
  test('mapt ervaring en kiest standaard "werk"', () => {
    expect(toExperience(entry({
      locale: 'nl',
      translation_key: 'hva',
      role: 'Student FDND',
      organisation: 'HvA',
      start: '2023-09-01',
      end: '',
      description: '<p>Opleiding</p>',
      kind: 'opleiding'
    }))).toEqual({
      id: 'e1',
      locale: 'nl',
      translationKey: 'hva',
      slug: '',
      role: 'Student FDND',
      organisation: 'HvA',
      start: '2023-09-01',
      end: '',
      descriptionHtml: '<p>Opleiding</p>',
      kind: 'opleiding'
    })
    expect(toExperience(entry({ locale: 'nl', translation_key: 'x', role: 'Dev', kind: '?' }))?.kind).toBe('werk')
  })

  test('geeft null zonder rol', () => {
    expect(toExperience(entry({ locale: 'nl', translation_key: 'x', role: '' }))).toBeNull()
  })
})

describe('toSkill', () => {
  test('mapt een skill', () => {
    expect(toSkill(entry({ locale: 'en', translation_key: 'ts', name: 'TypeScript', category: 'frontend', order: '2' }))).toEqual({
      id: 'e1',
      locale: 'en',
      translationKey: 'ts',
      slug: '',
      name: 'TypeScript',
      category: 'frontend',
      order: 2
    })
  })
})

describe('locale-helpers', () => {
  const nl = toProject(entry(waldNl, 'a'))!
  const en = toProject(entry({ ...waldNl, locale: 'en', slug: 'waldjs-en' }, 'b'))!
  const alleenNl = toProject(entry({ ...waldNl, translation_key: 'oud', slug: 'oud' }, 'c'))!
  const items = [nl, en, alleenNl]

  test('forLocale filtert op taal', () => {
    expect(forLocale(items, 'en')).toEqual([en])
  })

  test('translationsOf koppelt vertalingen via translationKey', () => {
    expect(translationsOf(items, 'waldjs')).toEqual({ nl, en })
    expect(translationsOf(items, 'oud')).toEqual({ nl: alleenNl })
  })

  test('missingTranslations meldt items zonder vertaling', () => {
    expect(missingTranslations(items)).toEqual([{ translationKey: 'oud', missing: ['en'] }])
  })
})

describe('transitionName', () => {
  test('geeft een geldige, voorspelbare CSS-naam per slug', () => {
    expect(transitionName('cover', 'waldjs')).toBe('cover-waldjs')
    expect(transitionName('title', 'eva-s-kookboek')).toBe('title-eva-s-kookboek')
    expect(transitionName('cover', '2024 Möhlen_VOF')).toBe('cover-2024-m-hlen-vof')
  })
})

describe('readingMinutes', () => {
  test('telt woorden zonder HTML, minstens één minuut', () => {
    expect(readingMinutes('')).toBe(1)
    expect(readingMinutes('<p>' + 'woord '.repeat(1000) + '</p>')).toBe(5)
    expect(readingMinutes('<h2>Kop</h2><p>' + 'woord '.repeat(450) + '</p>')).toBe(2)
  })
})
