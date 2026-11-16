import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { clearCmsCache, getCollection, getPage, getSiteSettings } from './cms'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('cms', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    process.env.CENTAUR_API_BASE = 'https://api.example.test/'
    process.env.CENTAUR_API_KEY = 'lees-sleutel'
    vi.stubGlobal('fetch', fetchMock)
    clearCmsCache()
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  test('zonder CENTAUR_API_BASE een duidelijke fout in plaats van "Failed to parse URL"', async () => {
    delete process.env.CENTAUR_API_BASE
    await expect(getCollection('projecten')).rejects.toThrow('CENTAUR_API_BASE ontbreekt')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('getCollection haalt gepubliceerde entries op met de API-sleutel', async () => {
    fetchMock.mockResolvedValue(json([{ id: 'a', data: { title: 'WaldJS' } }]))

    const entries = await getCollection('projecten')

    expect(entries).toEqual([{ id: 'a', data: { title: 'WaldJS' } }])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.example.test/content/projecten')
    expect(init.headers).toEqual({ 'X-Api-Key': 'lees-sleutel' })
  })

  test('preview-modus leest ook concepten via de manage-API met de schrijf-sleutel', async () => {
    process.env.CENTAUR_PREVIEW = '1'
    process.env.CENTAUR_WRITE_KEY = 'schrijf-sleutel'
    try {
      fetchMock.mockResolvedValue(json([{ id: 'c', data: {}, status: 'draft' }]))
      await expect(getCollection('projecten')).resolves.toHaveLength(1)
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe('https://api.example.test/api/manage/collections/projecten/entries')
      expect(init.headers).toEqual({ 'X-Api-Key': 'schrijf-sleutel' })
    } finally {
      delete process.env.CENTAUR_PREVIEW
      delete process.env.CENTAUR_WRITE_KEY
    }
  })

  test('zonder schrijf-sleutel blijft preview uit', async () => {
    process.env.CENTAUR_PREVIEW = '1'
    try {
      fetchMock.mockResolvedValue(json([]))
      await getCollection('blog')
      expect(fetchMock.mock.calls[0][0]).toBe('https://api.example.test/content/blog')
    } finally {
      delete process.env.CENTAUR_PREVIEW
    }
  })

  test('getCollection geeft een lege lijst als de collectie niet bestaat', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 404 }))
    await expect(getCollection('bestaat-niet')).resolves.toEqual([])
  })

  test('getCollection gooit bij een serverfout, zodat de build faalt', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 500 }))
    await expect(getCollection('projecten')).rejects.toThrow('Centaur /content/projecten gaf status 500')
  })

  test('getCollection vraagt dezelfde collectie maar één keer op', async () => {
    fetchMock.mockImplementation(async () => json([]))
    await Promise.all([getCollection('blog'), getCollection('blog')])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  test('een mislukte aanvraag wordt niet gecachet', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 500 }))
    await expect(getCollection('projecten')).rejects.toThrow()
    fetchMock.mockResolvedValueOnce(json([{ id: 'a', data: {} }]))
    await expect(getCollection('projecten')).resolves.toHaveLength(1)
  })

  test('getPage geeft null bij 404', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 404 }))
    await expect(getPage('bestaat-niet')).resolves.toBeNull()
  })

  test('getSiteSettings geeft de settings terug, en null bij een fout', async () => {
    fetchMock.mockResolvedValueOnce(json({ tenantSlug: 't', settings: { siteName: 'Steefan' } }))
    await expect(getSiteSettings()).resolves.toEqual({ siteName: 'Steefan' })

    clearCmsCache()
    fetchMock.mockResolvedValueOnce(new Response('', { status: 500 }))
    await expect(getSiteSettings()).resolves.toBeNull()
  })
})
