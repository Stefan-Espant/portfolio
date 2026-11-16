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

async function get<T>(path: string, key = apiKey()): Promise<T> {
  // Fail fast met een uitleg, in plaats van fetch's "Failed to parse URL" (bv. op Vercel zonder env-variabelen).
  if (!apiBase()) throw new Error('CENTAUR_API_BASE ontbreekt. Zet CENTAUR_API_BASE, CENTAUR_API_KEY en CENTAUR_TENANT_SLUG in .env of in de omgevingsvariabelen van Vercel (Production én Preview).')
  const response = await fetch(`${apiBase()}${path}`, {
    headers: { 'X-Api-Key': key },
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
/**
 * Preview-modus (alleen lokaal): met CENTAUR_PREVIEW=1 én een CENTAUR_WRITE_KEY leest de build via
 * de manage-API ook concepten, zodat je ongepubliceerde content kunt bekijken. Zet die twee nooit
 * op Vercel: de publieke site hoort alleen gepubliceerde items te tonen.
 */
export const isPreview = () => process.env.CENTAUR_PREVIEW === '1' && Boolean(process.env.CENTAUR_WRITE_KEY)

export function getCollection<T = Record<string, unknown>>(slug: string): Promise<CentaurEntry<T>[]> {
  const preview = isPreview()
  return memo(`collection:${slug}:${preview}`, async () => {
    try {
      return preview
        ? await get<CentaurEntry<T>[]>(`/api/manage/collections/${slug}/entries`, process.env.CENTAUR_WRITE_KEY)
        : await get<CentaurEntry<T>[]>(`/content/${slug}`)
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
