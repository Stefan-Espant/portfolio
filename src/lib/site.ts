/** Naam in titels, metadata en gestructureerde data (zoals in het logo). */
export const SITE_NAME = 'Stefan van der Kort'

/** Het domein van de live site. Canonicals, sitemap, RSS en JSON-LD wijzen hiernaar. */
export const PRODUCTION_URL = 'https://stefanvanderkort.nl'

// Publieke basis-URL van de site: SITE_URL, of op Vercel het vaste productiedomein. Niet Vercels eigen
// VERCEL_PROJECT_PRODUCTION_URL: die kiest bij meerdere domeinen het kortste (steefan.nl). Lokaal leeg,
// dan blijven paden relatief.
export function siteUrl(): string {
  const url = process.env.SITE_URL ?? (process.env.VERCEL ? PRODUCTION_URL : '')
  return url.replace(/\/$/, '')
}

/** Canonical, og:url en hreflang vereisen absolute URL's. Zonder bekende site-URL blijft het pad relatief. */
export function absoluteUrl(url: string): string {
  return url.startsWith('/') ? `${siteUrl()}${url}` : url
}

/** Contactadres voor de mailto-link op /contact. Pas hier aan als het adres verandert. */
export const CONTACT_EMAIL = 'info@espant.com'

export const GITHUB_URL = 'https://github.com/Stefan-Espant'

/** LinkedIn; een waarde in de Centaur-site settings gaat voor (die kan alleen via het dashboard). */
export const LINKEDIN_URL = 'https://www.linkedin.com/in/stefan-van-der-kort-196513158/'
