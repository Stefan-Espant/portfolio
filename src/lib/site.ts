// Publieke basis-URL van de site: SITE_URL, of op Vercel het productiedomein van het project.
export function siteUrl(): string {
  const url = process.env.SITE_URL
    ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
  return url.replace(/\/$/, '')
}

/** Canonical, og:url en hreflang vereisen absolute URL's. Zonder bekende site-URL blijft het pad relatief. */
export function absoluteUrl(url: string): string {
  return url.startsWith('/') ? `${siteUrl()}${url}` : url
}

/** Contactadres voor de mailto-link op /contact. Pas hier aan als het adres verandert. */
export const CONTACT_EMAIL = 'info@espant.com'

export const GITHUB_URL = 'https://github.com/Stefan-Espant'
