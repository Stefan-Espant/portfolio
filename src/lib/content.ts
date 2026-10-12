// Projecten, blogposts, ervaring en skills uit de Centaur-collecties (zie docs/centaur-collecties.md).
// Elke entry bestaat per taal; `locale` en `translation_key` koppelen de vertalingen.
import type { CentaurEntry } from './cms'
import { LOCALES, isLocale, type Locale } from './i18n'

type Data = Record<string, unknown>
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const num = (value: unknown) =>
  value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? 0 : Number(value)
const bool = (value: unknown) => value === true || value === 'true'
/** Lijst uit een tekstveld met komma's ("TypeScript, Vite") of uit een array. */
const list = (value: unknown): string[] =>
  (Array.isArray(value) ? value.map(text) : text(value).split(',')).map(item => item.trim()).filter(Boolean)
const rows = (value: unknown): Data[] =>
  Array.isArray(value) ? value.filter((row): row is Data => typeof row === 'object' && row !== null) : []

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
    liveUrl: text(data.live_url),
    repoUrl: text(data.repo_url),
    designUrl: text(data.design_url),
    npmPackage: text(data.npm_package)
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
