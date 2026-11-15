// Projecten, blogposts, ervaring en skills uit de Centaur-collecties (zie docs/centaur-collecties.md).
// Elke entry bestaat per taal; `locale` en `translation_key` koppelen de vertalingen.
import { getCollection, type CentaurEntry } from './cms'
import { LOCALES, isLocale, localePath, type Locale } from './i18n'

type Data = Record<string, unknown>
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const num = (value: unknown) =>
  value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? 0 : Number(value)
/** Alleen http(s)- en mailto-links uit het CMS; al het andere (bv. javascript:) wordt ''. */
export function safeUrl(value: unknown): string {
  const raw = text(value)
  if (!raw) return ''
  try {
    const url = new URL(raw)
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? raw : ''
  } catch {
    return ''
  }
}
const bool = (value: unknown) => value === true || value === 'true'
/** Lijst uit een tekstveld met komma's ("TypeScript, Vite") of uit een array. */
const list = (value: unknown): string[] =>
  (Array.isArray(value) ? value.map(text) : text(value).split(',')).map(item => item.trim()).filter(Boolean)
const rows = (value: unknown): Data[] =>
  Array.isArray(value) ? value.filter((row): row is Data => typeof row === 'object' && row !== null) : []

/**
 * Naam voor CSS View Transitions, gelijk op projectkaart en case study zodat cover en titel doorschuiven.
 * Een geldige CSS-identifier: alleen kleine letters, cijfers en koppeltekens, en nooit beginnend met een cijfer.
 */
export function transitionName(part: 'cover' | 'title', slug: string): string {
  return `${part}-${slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-')}`
}

/** Leestijd in minuten (minstens 1) bij ongeveer 200 woorden per minuut; HTML-tags tellen niet mee. */
export function readingMinutes(html: string): number {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export interface Metric {
  label: string
  value: string
}

/** Cijfers uit een tekstveld: één per regel, "Label: waarde" (bv. "Lighthouse: 100"). */
export function parseMetrics(value: unknown): Metric[] {
  return text(value).split('\n').flatMap(line => {
    const colon = line.indexOf(':')
    const label = line.slice(0, colon).trim()
    const metricValue = line.slice(colon + 1).trim()
    return colon > 0 && label && metricValue ? [{ label, value: metricValue }] : []
  })
}

export interface Localized {
  id: string
  locale: Locale
  translationKey: string
  /** Leeg bij collecties zonder eigen pagina (ervaring, skills). */
  slug: string
}

function localized(entry: CentaurEntry): Localized | null {
  const locale = text(entry.data.locale)
  const translationKey = text(entry.data.translation_key)
  if (!isLocale(locale) || !translationKey) return null
  return { id: entry.id, locale, translationKey, slug: text(entry.data.slug) }
}

// ── Projecten ────────────────────────────────────────────────────────────────────────────

export const PROJECT_TYPES = ['framework', 'product', 'website', 'school'] as const
export type ProjectType = (typeof PROJECT_TYPES)[number]

export interface Project extends Localized {
  title: string
  summary: string
  type: ProjectType
  featured: boolean
  order: number
  year: number
  client: string
  stack: string[]
  cover: string
  coverAlt: string
  problemHtml: string
  approachHtml: string
  resultHtml: string
  gallery: Array<{ src: string; alt: string }>
  liveUrl: string
  repoUrl: string
  designUrl: string
  npmPackage: string
  metrics: Metric[]
}

export function toProject(entry: CentaurEntry): Project | null {
  const base = localized(entry)
  const data = entry.data
  const title = text(data.title)
  if (!base || !base.slug || !title) return null
  const type = text(data.type)
  return {
    ...base,
    title,
    summary: text(data.summary),
    type: (PROJECT_TYPES as readonly string[]).includes(type) ? (type as ProjectType) : 'website',
    featured: bool(data.featured),
    order: num(data.order),
    year: num(data.year),
    client: text(data.client),
    stack: list(data.stack),
    cover: text(data.cover),
    coverAlt: text(data.cover_alt) || title,
    problemHtml: text(data.problem),
    approachHtml: text(data.approach),
    resultHtml: text(data.result),
    gallery: rows(data.gallery).map(row => ({ src: text(row.image), alt: text(row.alt) })).filter(image => image.src),
    liveUrl: safeUrl(data.live_url),
    repoUrl: safeUrl(data.repo_url),
    designUrl: safeUrl(data.design_url),
    npmPackage: text(data.npm_package),
    metrics: parseMetrics(data.metrics)
  }
}

// ── Blog ─────────────────────────────────────────────────────────────────────────────────

export interface Post extends Localized {
  title: string
  excerpt: string
  bodyHtml: string
  cover: string
  coverAlt: string
  /** ISO-datum, bv. "2024-05-01". */
  publishedAt: string
  tags: string[]
}

export function toPost(entry: CentaurEntry): Post | null {
  const base = localized(entry)
  const data = entry.data
  const title = text(data.title)
  if (!base || !base.slug || !title) return null
  return {
    ...base,
    title,
    excerpt: text(data.excerpt),
    bodyHtml: text(data.body),
    cover: text(data.cover),
    coverAlt: text(data.cover_alt) || title,
    publishedAt: text(data.published_at),
    tags: list(data.tags)
  }
}

// ── Ervaring en skills ───────────────────────────────────────────────────────────────────

export interface Experience extends Localized {
  role: string
  organisation: string
  start: string
  /** Leeg = heden. */
  end: string
  descriptionHtml: string
  kind: 'werk' | 'opleiding'
}

export function toExperience(entry: CentaurEntry): Experience | null {
  const base = localized(entry)
  const data = entry.data
  const role = text(data.role)
  if (!base || !role) return null
  return {
    ...base,
    role,
    organisation: text(data.organisation),
    start: text(data.start),
    end: text(data.end),
    descriptionHtml: text(data.description),
    kind: text(data.kind) === 'opleiding' ? 'opleiding' : 'werk'
  }
}

export interface Skill extends Localized {
  name: string
  category: string
  order: number
}

export function toSkill(entry: CentaurEntry): Skill | null {
  const base = localized(entry)
  const name = text(entry.data.name)
  if (!base || !name) return null
  return { ...base, name, category: text(entry.data.category), order: num(entry.data.order) }
}

// ── Status en klanten ────────────────────────────────────────────────────────────────────

export interface Status extends Localized {
  available: boolean
  text: string
}

export function toStatus(entry: CentaurEntry): Status | null {
  const base = localized(entry)
  const statusText = text(entry.data.text)
  if (!base || !statusText) return null
  return { ...base, available: bool(entry.data.available), text: statusText }
}

export interface Client extends Localized {
  name: string
  logo: string
  url: string
  quote: string
  quoteAuthor: string
  order: number
}

export function toClient(entry: CentaurEntry): Client | null {
  const base = localized(entry)
  const data = entry.data
  const name = text(data.name)
  if (!base || !name) return null
  return { ...base, name, logo: text(data.logo), url: safeUrl(data.url), quote: text(data.quote), quoteAuthor: text(data.quote_author), order: num(data.order) }
}

// ── Locale-helpers ───────────────────────────────────────────────────────────────────────

export function forLocale<T extends Localized>(items: T[], locale: Locale): T[] {
  return items.filter(item => item.locale === locale)
}

export function translationsOf<T extends Localized>(items: T[], translationKey: string): Partial<Record<Locale, T>> {
  const translations: Partial<Record<Locale, T>> = {}
  for (const item of items) if (item.translationKey === translationKey) translations[item.locale] = item
  return translations
}

export function missingTranslations<T extends Localized>(items: T[]): Array<{ translationKey: string; missing: Locale[] }> {
  return [...new Set(items.map(item => item.translationKey))]
    .map(translationKey => {
      const translations = translationsOf(items, translationKey)
      return { translationKey, missing: LOCALES.filter(locale => !translations[locale]) }
    })
    .filter(result => result.missing.length > 0)
}

// ── Loaders ──────────────────────────────────────────────────────────────────────────────
// Elke collectie wordt per build één keer opgehaald en gemapt. Entries zonder verplichte
// velden en ontbrekende vertalingen komen als waarschuwing in de build-log.

const loaded = new Map<string, Promise<Localized[]>>()

function load<T extends Localized>(collection: string, map: (entry: CentaurEntry) => T | null): Promise<T[]> {
  if (!loaded.has(collection)) {
    const promise = (async () => {
      const items: T[] = []
      const slugs = new Set<string>()
      for (const entry of await getCollection(collection)) {
        const item = map(entry)
        if (!item) {
          console.warn(`⚠ ${collection}: entry ${entry.id} mist verplichte velden en wordt overgeslagen`)
          continue
        }
        // Twee entries met dezelfde slug in één taal zouden dezelfde URL krijgen.
        const slugKey = `${item.locale}:${item.slug}`
        if (item.slug && slugs.has(slugKey)) {
          console.warn(`⚠ ${collection}: slug "${item.slug}" (${item.locale}) komt meerdere keren voor; entry ${entry.id} wordt overgeslagen`)
          continue
        }
        slugs.add(slugKey)
        items.push(item)
      }
      for (const { translationKey, missing } of missingTranslations(items)) {
        console.warn(`⚠ ${collection}: "${translationKey}" heeft geen vertaling in ${missing.join(', ')}`)
      }
      return items
    })()
    loaded.set(collection, promise)
    // Een fout niet bewaren: in `wald grow` moet een volgende aanvraag het opnieuw proberen.
    promise.catch(() => {
      if (loaded.get(collection) === promise) loaded.delete(collection)
    })
  }
  return loaded.get(collection) as Promise<T[]>
}

export function clearContentCache(): void {
  loaded.clear()
}

const loadProjects = () => load('projecten', toProject)
const loadPosts = () => load('blog', toPost)

/** Zonder volgorde in Centaur (0) achteraan, niet vooraan. */
const rank = (order: number) => order || Number.MAX_SAFE_INTEGER

const byProjectOrder = (a: Project, b: Project) =>
  Number(b.featured) - Number(a.featured) || rank(a.order) - rank(b.order) || b.year - a.year

export async function getProjects(locale: Locale): Promise<Project[]> {
  return forLocale(await loadProjects(), locale).sort(byProjectOrder)
}

export async function getFeaturedProjects(locale: Locale): Promise<Project[]> {
  return (await getProjects(locale)).filter(project => project.featured)
}

export async function getProject(slug: string, locale: Locale): Promise<Project | null> {
  return (await getProjects(locale)).find(project => project.slug === slug) ?? null
}

/** Paden van dit project in elke taal waarin het bestaat (voor hreflang en de taalwissel). */
export async function projectAlternates(project: Project): Promise<Partial<Record<Locale, string>>> {
  const translations = translationsOf(await loadProjects(), project.translationKey)
  return Object.fromEntries(
    Object.entries(translations).map(([locale, item]) => [locale, localePath('project', locale as Locale, item.slug)])
  )
}

export async function getPosts(locale: Locale): Promise<Post[]> {
  return forLocale(await loadPosts(), locale).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export async function getPost(slug: string, locale: Locale): Promise<Post | null> {
  return (await getPosts(locale)).find(post => post.slug === slug) ?? null
}

export async function postAlternates(post: Post): Promise<Partial<Record<Locale, string>>> {
  const translations = translationsOf(await loadPosts(), post.translationKey)
  return Object.fromEntries(
    Object.entries(translations).map(([locale, item]) => [locale, localePath('post', locale as Locale, item.slug)])
  )
}

const loadExperience = () => load('ervaring', toExperience)
const loadSkills = () => load('skills', toSkill)

export async function getExperience(locale: Locale): Promise<Experience[]> {
  return forLocale(await loadExperience(), locale).sort((a, b) => b.start.localeCompare(a.start))
}

export async function getSkills(locale: Locale): Promise<Skill[]> {
  return forLocale(await loadSkills(), locale)
    .sort((a, b) => a.category.localeCompare(b.category) || rank(a.order) - rank(b.order))
}

export async function getOtherProjects(locale: Locale): Promise<Project[]> {
  return (await getProjects(locale)).filter(project => !project.featured)
}

/** De beschikbaarheid in deze taal, of null als er (nog) geen entry is. */
export async function getStatus(locale: Locale): Promise<Status | null> {
  return forLocale(await load('status', toStatus), locale)[0] ?? null
}

export async function getClients(locale: Locale): Promise<Client[]> {
  return forLocale(await load('klanten', toClient), locale)
    .sort((a, b) => rank(a.order) - rank(b.order) || a.name.localeCompare(b.name))
}

/** Datum (ISO) van de laatst gewijzigde entry in alle collecties; leeg als er niets is. Voor de build-strip. */
export async function getLastContentUpdate(): Promise<string> {
  const collections = ['projecten', 'blog', 'ervaring', 'skills', 'status', 'klanten']
  const entries = (await Promise.all(collections.map(collection => getCollection(collection)))).flat()
  return entries.map(entry => entry.updatedAt).filter(Boolean).sort().at(-1) ?? ''
}
