import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { clearGithubCache, getRecentRepos, toRepos } from './github'

const raw = [
  { name: 'oud', description: null, html_url: 'https://github.com/x/oud', language: 'Vue', stargazers_count: 1, pushed_at: '2024-01-01T00:00:00Z', fork: false, archived: false },
  { name: 'WaldJS', description: 'Framework', html_url: 'https://github.com/x/WaldJS', language: 'TypeScript', stargazers_count: 12, pushed_at: '2026-10-10T00:00:00Z', fork: false, archived: false },
  { name: 'fork', html_url: 'https://github.com/x/fork', pushed_at: '2026-10-11T00:00:00Z', fork: true, archived: false },
  { name: 'archief', html_url: 'https://github.com/x/archief', pushed_at: '2026-10-11T00:00:00Z', fork: false, archived: true }
]

describe('toRepos', () => {
  test('zonder forks en archief, nieuwste eerst, met limiet', () => {
    expect(toRepos(raw, 6)).toEqual([
      { name: 'WaldJS', description: 'Framework', url: 'https://github.com/x/WaldJS', language: 'TypeScript', stars: 12, pushedAt: '2026-10-10T00:00:00Z' },
      { name: 'oud', description: '', url: 'https://github.com/x/oud', language: 'Vue', stars: 1, pushedAt: '2024-01-01T00:00:00Z' }
    ])
    expect(toRepos(raw, 1)).toHaveLength(1)
    expect(toRepos({ message: 'rate limit' })).toEqual([])
  })
})

describe('getRecentRepos', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    clearGithubCache()
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    delete process.env.GITHUB_TOKEN
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  test('haalt repos op, met token als die er is', async () => {
    process.env.GITHUB_TOKEN = 'geheim'
    fetchMock.mockResolvedValue(new Response(JSON.stringify(raw), { status: 200 }))

    const repos = await getRecentRepos()

    expect(repos?.map(repo => repo.name)).toEqual(['WaldJS', 'oud'])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.github.com/users/Stefan-Espant/repos?per_page=100&sort=pushed')
    expect(init.headers.Authorization).toBe('Bearer geheim')
  })

  test('geeft null en waarschuwt bij een fout, zodat de sectie wegvalt', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 403 }))

    await expect(getRecentRepos()).resolves.toBeNull()
    expect(console.warn).toHaveBeenCalledWith('⚠ GitHub: repos ophalen mislukt (status 403), sectie wordt overgeslagen')
  })
})
