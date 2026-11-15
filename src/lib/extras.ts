// Pure helpers voor de extra's die de build maakt (spec 2026-10-12, Extra's): RSS-feeds, het pad van de
// social-afbeelding per pagina en het invullen van de build-strip. De bestanden zelf schrijft
// src/build/extras.ts in de adapter-stap; hier staat alleen wat te testen valt.
import type { Post } from './content'
import { localePath, type Locale } from './i18n'
import { absoluteUrl } from './site'

const xml = (text: string) => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!)

const FEED = {
  nl: { title: 'Steefan — blog', description: 'Artikelen van Stefan over webdevelopment, design en het bouwen van eigen tools.', language: 'nl-NL', path: '/rss.xml' },
  en: { title: 'Steefan — blog', description: 'Articles by Stefan about web development, design and building your own tools.', language: 'en-GB', path: '/en/rss.xml' }
} as const

/** Pad van de feed per taal, voor de <link rel="alternate"> in de head en de footer. */
export const feedPath = (locale: Locale) => FEED[locale].path

/** RSS 2.0-feed met de posts van één taal (nieuwste eerst, zoals getPosts ze levert). */
export function buildRss(posts: Post[], locale: Locale, builtAt: string): string {
  const feed = FEED[locale]
  const items = posts.map(post => {
    const url = absoluteUrl(localePath('post', locale, post.slug))
    const date = post.publishedAt ? `\n      <pubDate>${new Date(post.publishedAt.slice(0, 10) + 'T00:00:00Z').toUTCString()}</pubDate>` : ''
    const tags = post.tags.map(tag => `\n      <category>${xml(tag)}</category>`).join('')
    return `
    <item>
      <title>${xml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${xml(post.excerpt)}</description>${date}${tags}
    </item>`
  }).join('')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(feed.title)}</title>
    <link>${absoluteUrl(localePath('blog', locale))}</link>
    <description>${xml(feed.description)}</description>
    <language>${feed.language}</language>
    <lastBuildDate>${new Date(builtAt).toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl(feed.path)}" rel="self" type="application/rss+xml"/>${items}
  </channel>
</rss>
`
}

/** Social-afbeelding per pagina: "/werk/waldjs" → "/og/werk-waldjs.png", de home → "/og/home.png". */
export function ogImagePath(path: string): string {
  const name = path.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9-]+/gi, '-').toLowerCase() || 'home'
  return `/og/${name}.png`
}

/** Bytes als "1,5 kB" (nl) of "1.5 kB" (en); hele getallen zonder decimaal. */
export function formatKb(bytes: number, locale: Locale): string {
  const kb = Math.round((bytes / 1024) * 10) / 10
  return `${Number.isInteger(kb) ? kb : kb.toFixed(1).replace('.', locale === 'nl' ? ',' : '.')} kB`
}

/** Vult de inhoud van elementen met data-build="<sleutel>" in; onbekende sleutels blijven staan. */
export function fillBuildStrip(html: string, values: Record<string, string>): string {
  return html.replace(/(<(\w+)[^>]*\sdata-build="([\w-]+)"[^>]*>)[^<]*(<\/\2>)/g, (match, open, _tag, key, close) =>
    key in values ? open + xml(values[key]) + close : match)
}
