// Recente publieke repos van Stefan-Espant, opgehaald tijdens de build. Het token (optioneel,
// voor een hogere rate limit) blijft in Node. Mislukt het ophalen, dan geeft dit null en laat
// de over-pagina de GitHub-sectie weg: de build faalt er niet op.

export interface Repo {
  name: string
  description: string
  url: string
  language: string
  stars: number
  pushedAt: string
}

const USER = 'Stefan-Espant'

type RawRepo = Record<string, unknown>
const str = (value: unknown) => (typeof value === 'string' ? value : '')

export function toRepos(raw: unknown, limit = 6): Repo[] {
  if (!Array.isArray(raw)) return []
  return (raw as RawRepo[])
    .filter(repo => repo && !repo.fork && !repo.archived && typeof repo.name === 'string')
    .map(repo => ({
      name: str(repo.name),
      description: str(repo.description),
      url: str(repo.html_url),
      language: str(repo.language),
      stars: Number(repo.stargazers_count) || 0,
      pushedAt: str(repo.pushed_at)
    }))
    .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt))
    .slice(0, limit)
}

let cached: Promise<Repo[] | null> | null = null

export function clearGithubCache(): void {
  cached = null
}

export function getRecentRepos(limit = 6): Promise<Repo[] | null> {
  cached ??= (async () => {
    try {
      const token = process.env.GITHUB_TOKEN
      const response = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, {
        headers: { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        signal: AbortSignal.timeout(8000)
      })
      if (!response.ok) throw new Error(`status ${response.status}`)
      return toRepos(await response.json(), limit)
    } catch (error) {
      console.warn(`⚠ GitHub: repos ophalen mislukt (${(error as Error).message}), sectie wordt overgeslagen`)
      return null
    }
  })()
  return cached
}
