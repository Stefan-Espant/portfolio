import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('./cms', () => ({ getCollection: vi.fn() }))

import { getCollection } from './cms'
import {
  clearContentCache,
  getExperience,
  getFeaturedProjects,
  getPost,
  getPosts,
  getProject,
  getProjects,
  getSkills,
  postAlternates,
  projectAlternates
} from './content'

const entry = (id: string, data: Record<string, unknown>) => ({
  id, data, status: 'published', publishedAt: null, createdAt: '', updatedAt: ''
})

const collections: Record<string, ReturnType<typeof entry>[]> = {
  projecten: [
    entry('p1', { locale: 'nl', translation_key: 'wald', slug: 'waldjs', title: 'WaldJS', featured: true, order: 2, year: 2026 }),
    entry('p2', { locale: 'nl', translation_key: 'centaur', slug: 'centaur-cms', title: 'Centaur CMS', featured: true, order: 1, year: 2026 }),
    entry('p3', { locale: 'nl', translation_key: 'oud', slug: 'oud-project', title: 'Oud', featured: false, order: 0, year: 2023 }),
    entry('p4', { locale: 'en', translation_key: 'wald', slug: 'waldjs', title: 'WaldJS', featured: true, order: 2, year: 2026 }),
    entry('p5', { locale: 'nl', translation_key: 'kapot', slug: '', title: 'Zonder slug' })
  ],
  blog: [
    entry('b1', { locale: 'nl', translation_key: 'a', slug: 'eerste', title: 'Eerste', published_at: '2024-01-10' }),
    entry('b2', { locale: 'nl', translation_key: 'b', slug: 'tweede', title: 'Tweede', published_at: '2025-03-02' }),
    entry('b3', { locale: 'en', translation_key: 'b', slug: 'second', title: 'Second', published_at: '2025-03-02' })
  ],
  ervaring: [
    entry('x1', { locale: 'nl', translation_key: 'hva', role: 'Student', start: '2023-09-01' }),
    entry('x2', { locale: 'nl', translation_key: 'semantique', role: 'Developer', start: '2025-02-01' })
  ],
  skills: [
    entry('s1', { locale: 'nl', translation_key: 'css', name: 'CSS', category: 'frontend', order: 2 }),
    entry('s2', { locale: 'nl', translation_key: 'figma', name: 'Figma', category: 'design', order: 1 }),
    entry('s3', { locale: 'nl', translation_key: 'html', name: 'HTML', category: 'frontend', order: 1 })
  ]
}

describe('content-loaders', () => {
  beforeEach(() => {
    clearContentCache()
    vi.mocked(getCollection).mockClear()
    vi.mocked(getCollection).mockImplementation(async slug => collections[slug] ?? [])
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  test('getProjects: alleen de gevraagde taal, featured eerst, dan op order', async () => {
    const projects = await getProjects('nl')
    expect(projects.map(p => p.slug)).toEqual(['centaur-cms', 'waldjs', 'oud-project'])
  })

  test('slaat entries zonder verplichte velden over en waarschuwt', async () => {
    await getProjects('nl')
    expect(console.warn).toHaveBeenCalledWith('⚠ projecten: entry p5 mist verplichte velden en wordt overgeslagen')
  })

  test('waarschuwt voor ontbrekende vertalingen', async () => {
    await getProjects('nl')
    expect(console.warn).toHaveBeenCalledWith('⚠ projecten: "centaur" heeft geen vertaling in en')
  })

  test('getFeaturedProjects en getProject', async () => {
    expect((await getFeaturedProjects('nl')).map(p => p.slug)).toEqual(['centaur-cms', 'waldjs'])
    expect((await getProject('waldjs', 'en'))?.id).toBe('p4')
    expect(await getProject('bestaat-niet', 'nl')).toBeNull()
  })

  test('projectAlternates geeft de paden van alle vertalingen', async () => {
    const project = (await getProject('waldjs', 'nl'))!
    expect(await projectAlternates(project)).toEqual({ nl: '/werk/waldjs', en: '/en/work/waldjs' })
  })

  test('getPosts: nieuwste eerst; getPost en postAlternates', async () => {
    expect((await getPosts('nl')).map(p => p.slug)).toEqual(['tweede', 'eerste'])
    const post = (await getPost('tweede', 'nl'))!
    expect(await postAlternates(post)).toEqual({ nl: '/blog/tweede', en: '/en/blog/second' })
  })

  test('getExperience: nieuwste eerst', async () => {
    expect((await getExperience('nl')).map(e => e.translationKey)).toEqual(['semantique', 'hva'])
  })

  test('getSkills: op categorie, dan order', async () => {
    expect((await getSkills('nl')).map(s => s.name)).toEqual(['Figma', 'HTML', 'CSS'])
  })

  test('vraagt elke collectie maar één keer op', async () => {
    await Promise.all([getProjects('nl'), getProjects('en'), getFeaturedProjects('nl')])
    expect(vi.mocked(getCollection).mock.calls.filter(([slug]) => slug === 'projecten')).toHaveLength(1)
  })

  test('een mislukte collectie wordt niet gecachet', async () => {
    vi.mocked(getCollection).mockRejectedValueOnce(new Error('Centaur down'))
    await expect(getProjects('nl')).rejects.toThrow('Centaur down')
    expect((await getProjects('nl')).map(p => p.slug)).toEqual(['centaur-cms', 'waldjs', 'oud-project'])
  })
})
