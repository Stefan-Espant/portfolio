// Pure omzettingen van DatoCMS-records naar entry-data voor Centaur (veldslugs: docs/centaur-collecties.md).
// Alles komt als Nederlandse versie binnen; de Engelse vertalingen worden apart geschreven.
import { marked } from 'marked'

export interface DatoProject {
  id: string
  heading: string
  client: string | null
  date: string | null
  url: string | null
  urlDesign: string | null
  image: { url: string; alt: string | null } | null
}

export interface DatoArticle {
  id: string
  title: string
  datum: string | null
  /** Markdown. */
  paragraaf: string | null
  _createdAt: string
}

export type EntryData = Record<string, string | number | boolean>

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Lege strings en 0 weglaten, zodat Centaur geen lege waarden opslaat. */
function compact(data: Record<string, string | number | boolean | null | undefined>): EntryData {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== '' && value !== null && value !== undefined && value !== 0)
  ) as EntryData
}

/** Slug die niet leeg is; anders is het record niet bruikbaar als URL. */
function requireSlug(title: string): string {
  const slug = slugify(title)
  if (!slug) throw new Error(`Geen slug te maken van titel "${title}"`)
  return slug
}

export function projectToEntry(project: DatoProject, coverUrl: string): EntryData {
  const slug = requireSlug(project.heading)
  return compact({
    locale: 'nl',
    translation_key: slug,
    slug,
    title: project.heading,
    type: 'school',
    featured: false,
    order: 100,
    year: Number(project.date?.slice(0, 4)) || 0,
    client: project.client,
    cover: coverUrl,
    cover_alt: project.image?.alt || project.heading,
    live_url: project.url,
    design_url: project.urlDesign
  })
}

const EXCERPT_LENGTH = 160

export function articleToEntry(article: DatoArticle): EntryData {
  const slug = requireSlug(article.title)
  const body = marked.parse(article.paragraaf ?? '', { async: false }) as string
  // Blok-tags worden een spatie, inline-tags verdwijnen ("<strong>wereld</strong>." → "wereld.").
  const stripped = body
    .replace(/<\/(p|h[1-6]|li|blockquote|pre)>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  // marked escapt tekst; &amp; als laatste, zodat &amp;lt; niet dubbel wordt gedecodeerd.
  const plain = stripped
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
  let excerpt = plain
  if (plain.length > EXCERPT_LENGTH) {
    // Geen spatie in de eerste 160 tekens: kap hard af in plaats van op -1 te snijden.
    const cut = plain.lastIndexOf(' ', EXCERPT_LENGTH - 1)
    excerpt = plain.slice(0, cut > 0 ? cut : EXCERPT_LENGTH - 1) + '…'
  }
  return compact({
    locale: 'nl',
    translation_key: slug,
    slug,
    title: article.title,
    excerpt,
    body,
    published_at: (article.datum || article._createdAt).slice(0, 10)
  })
}
