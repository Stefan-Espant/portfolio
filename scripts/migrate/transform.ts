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
    .replace(/[̀-ͯ]/g, '')
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

export function projectToEntry(project: DatoProject, coverUrl: string): EntryData {
  const slug = slugify(project.heading)
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
  const slug = slugify(article.title)
  const body = marked.parse(article.paragraaf ?? '', { async: false }) as string
  // Blok-tags worden een spatie, inline-tags verdwijnen ("<strong>wereld</strong>." → "wereld.").
  const plain = body
    .replace(/<\/(p|h[1-6]|li|blockquote|pre)>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const excerpt = plain.length > EXCERPT_LENGTH
    ? plain.slice(0, plain.lastIndexOf(' ', EXCERPT_LENGTH - 1)) + '…'
    : plain
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
