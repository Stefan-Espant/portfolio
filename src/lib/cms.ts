// Alle Centaur-calls draaien alleen tijdens `wald build` / `wald grow` (in Node), nooit in de
// browser: de API-sleutel komt dus nooit in de HTML terecht.

export interface CentaurEntry<T = Record<string, unknown>> {
  id: string
  data: T
  status: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CentaurPage {
  id: string
  title: string
  slug: string
  metaDescription: string
  body: Array<Record<string, unknown>>
  locale?: string | null
  metaTitle?: string | null
  ogImage?: string | null
  updatedAt: string
}

export interface CentaurSiteSettings {
  siteName: string
  tagline: string
  defaultOgImageUrl: string
  faviconUrl: string
  linkedIn: string
  instagram: string
}

// Zonder timeout kan een onbereikbare Centaur API de build onbeperkt laten hangen.
const FETCH_TIMEOUT_MS = 8000

const apiBase = () => (process.env.CENTAUR_API_BASE ?? '').replace(/\/$/, '')
const apiKey = () => process.env.CENTAUR_API_KEY ?? ''

class CentaurError extends Error {
  constructor(public status: number, path: string) {
    super(`Centaur ${path} gaf status ${status}`)
  }
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    headers: { 'X-Api-Key': apiKey() },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
  })
  if (!response.ok) throw new CentaurError(response.status, path)
  return response.json() as Promise<T>
}

// Tijdens één build vragen veel pagina's dezelfde data op; memoizen voorkomt dubbele calls.
const cache = new Map<string, Promise<unknown>>()
function memo<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) {
    const promise = load()
    cache.set(key, promise)
    // Een fout niet bewaren: in `wald grow` moet een volgende aanvraag het opnieuw proberen.
    promise.catch(() => cache.delete(key))
  }
  return cache.get(key) as Promise<T>
}

export function clearCmsCache(): void {
  cache.clear()
}

/** Alle gepubliceerde entries van een collectie. Een collectie die (nog) niet bestaat geeft []. */
export function getCollection<T = Record<string, unknown>>(slug: string): Promise<CentaurEntry<T>[]> {
  return memo(`collection:${slug}`, async () => {
    try {
      return await get<CentaurEntry<T>[]>(`/content/${slug}`)
    } catch (error) {
      if (error instanceof CentaurError && error.status === 404) return []
      throw error
    }
  })
}

export function getPage(slug: string): Promise<CentaurPage | null> {
  return memo(`page:${slug}`, async () => {
    try {
      return await get<CentaurPage>(`/api/public/pages/${slug}`)
    } catch (error) {
      if (error instanceof CentaurError && error.status === 404) return null
      throw error
    }
  })
}

/** Site-instellingen zijn optioneel: bij een fout valt de site terug op eigen standaardwaarden. */
export function getSiteSettings(): Promise<CentaurSiteSettings | null> {
  return memo('site-settings', async () => {
    try {
      return (await get<{ settings: CentaurSiteSettings }>('/api/public/site')).settings
    } catch {
      return null
    }
  })
}
