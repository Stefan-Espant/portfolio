// Eenmalige migratie: projecten (portfolio-DatoCMS) en blogposts (i-love-web-DatoCMS) → Centaur,
// als NL-concepten. Idempotent: items waarvan de translation_key al bestaat worden overgeslagen.
//
// Gebruik:  npm run migrate -- --dry-run   (alleen tonen wat er zou gebeuren)
//           npm run migrate                (echt aanmaken)
import { existsSync, readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { articleToEntry, projectToEntry, type DatoArticle, type DatoProject, type EntryData } from './migrate/transform'

if (existsSync('.env')) {
  const env = parseEnv(readFileSync('.env', 'utf8').replace(/^\uFEFF/, ''))
  for (const [key, value] of Object.entries(env)) process.env[key] ??= value
}

const dryRun = process.argv.includes('--dry-run')
const missing = ['DATO_CMS_TOKEN', 'CENTAUR_API_BASE', 'CENTAUR_WRITE_KEY'].filter(key => !process.env[key])
if (missing.length) {
  console.error(`Ontbrekende env vars in .env: ${missing.join(', ')}`)
  process.exit(1)
}
const API = process.env.CENTAUR_API_BASE!.replace(/\/$/, '')
const WRITE_KEY = process.env.CENTAUR_WRITE_KEY!

async function dato<T>(token: string, query: string): Promise<T> {
  const response = await fetch('https://graphql.datocms.com', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
  const json = (await response.json()) as { data?: T; errors?: unknown }
  if (!response.ok || json.errors || !json.data) throw new Error(`DatoCMS ${response.status}: ${JSON.stringify(json.errors)}`)
  return json.data
}

async function centaur<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'X-Api-Key': WRITE_KEY, ...(init.headers as Record<string, string> | undefined) }
  })
  if (!response.ok) throw new Error(`Centaur ${init.method ?? 'GET'} ${path}: ${response.status} ${await response.text()}`)
  return response.json() as Promise<T>
}

interface ExistingEntry {
  id: string
  data: Record<string, unknown>
  updatedAt: string
}

async function existingKeys(collection: string): Promise<Map<string, ExistingEntry>> {
  const entries = await centaur<ExistingEntry[]>(`/api/manage/collections/${collection}/entries`)
  return new Map(entries.map(entry => [String(entry.data.translation_key ?? ''), entry]))
}

async function uploadImage(url: string, alt: string): Promise<string> {
  const image = await fetch(url)
  if (!image.ok) throw new Error(`Afbeelding ${url}: ${image.status}`)
  const form = new FormData()
  const name = new URL(url).pathname.split('/').pop() || 'cover'
  form.append('file', new Blob([await image.arrayBuffer()], { type: image.headers.get('content-type') ?? 'application/octet-stream' }), name)
  form.append('alt', alt)
  return (await centaur<{ url: string }>('/api/manage/media', { method: 'POST', body: form })).url
}

async function createEntry(collection: string, data: EntryData): Promise<void> {
  await centaur(`/api/manage/collections/${collection}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  })
}

const BLOG_WARNING = '⚠ DATO_BLOG_TOKEN ontbreekt: blogposts worden overgeslagen. Vul het token in .env in en draai het script opnieuw (bestaande items worden overgeslagen).'
const blogToken = process.env.DATO_BLOG_TOKEN

const { allProjects } = await dato<{ allProjects: DatoProject[] }>(
  process.env.DATO_CMS_TOKEN!,
  '{ allProjects(first: 100) { id heading client date url urlDesign image { url alt } } }'
)
let allArticles: DatoArticle[] = []
if (blogToken) {
  allArticles = (
    await dato<{ allArticles: DatoArticle[] }>(blogToken, '{ allArticles(first: 100) { id title datum paragraaf _createdAt } }')
  ).allArticles
} else {
  console.log(BLOG_WARNING)
}

// Alle entries vooraf berekenen: fouten en dubbele translation_keys moeten vóór de eerste schrijfactie boven water komen.
interface Planned<T> {
  record: T
  label: string
  preview: EntryData
}
let problems = 0

function plan<T extends { id: string }>(records: T[], titleOf: (r: T) => string, build: (r: T) => EntryData, kind: string): Array<Planned<T>> {
  const planned: Array<Planned<T>> = []
  for (const record of records) {
    try {
      planned.push({ record, label: `${record.id} "${titleOf(record)}"`, preview: build(record) })
    } catch (error) {
      problems++
      console.error(`✗ ${kind}: ${record.id} "${titleOf(record)}": ${(error as Error).message}`)
    }
  }
  const byKey = new Map<string, Array<Planned<T>>>()
  for (const item of planned) {
    const key = String(item.preview.translation_key)
    byKey.set(key, [...(byKey.get(key) ?? []), item])
  }
  for (const [key, items] of byKey) {
    if (items.length < 2) continue
    problems++
    console.error(`✗ ${kind}: dubbele translation_key "${key}" voor: ${items.map(item => item.label).join('; ')}`)
  }
  return planned
}

const plannedProjects = plan(allProjects, p => p.heading, p => projectToEntry(p, ''), 'projecten')
const plannedArticles = plan(allArticles, a => a.title, articleToEntry, 'blog')
if (problems) {
  console.error(`${problems} probleem/problemen gevonden; er is niets aangemaakt. Los ze op in DatoCMS en draai opnieuw.`)
  process.exit(1)
}

const [projectKeys, postKeys] = await Promise.all([
  existingKeys('projecten'),
  blogToken ? existingKeys('blog') : Promise.resolve(new Map<string, ExistingEntry>())
])

let created = 0
let updated = 0
let skipped = 0

for (const { record: project, preview } of plannedProjects) {
  const existing = projectKeys.get(String(preview.translation_key))
  if (existing) {
    const image = project.image?.[0]
    if (existing.data.cover || !image?.url) {
      skipped++
      console.log(`= projecten/${preview.slug} bestaat al`)
      continue
    }
    if (dryRun) {
      console.log(`~ projecten/${preview.slug}: cover toevoegen`)
      continue
    }
    const cover = await uploadImage(image.url, image.alt || String(preview.title))
    try {
      await centaur(`/api/manage/collections/projecten/entries/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry: { data: { ...existing.data, cover, cover_alt: existing.data.cover_alt || image.alt || preview.title } },
          expectedUpdatedAt: existing.updatedAt
        })
      })
    } catch (error) {
      if (String((error as Error).message).includes(': 409 ')) {
        console.warn(`⚠ projecten/${preview.slug}: conflict (ondertussen gewijzigd in Centaur), cover niet toegevoegd; draai het script opnieuw`)
        continue
      }
      throw error
    }
    updated++
    console.log(`~ projecten/${preview.slug}: cover toegevoegd`)
    continue
  }
  if (dryRun) {
    console.log(`+ projecten/${preview.slug}`, preview)
    continue
  }
  // Mislukt het aanmaken na de upload, dan blijft de afbeelding los in Centaur staan; een nieuwe run uploadt hem opnieuw (acceptabel voor een eenmalige migratie).
  const image = project.image?.[0]
  const cover = image?.url ? await uploadImage(image.url, image.alt || String(preview.title)) : ''
  await createEntry('projecten', projectToEntry(project, cover))
  projectKeys.add(String(preview.translation_key))
  created++
  console.log(`+ projecten/${preview.slug}`)
}

for (const { preview: data } of plannedArticles) {
  if (!data.body) {
    skipped++
    console.warn(`⚠ blog/${data.slug}: lege tekst, overgeslagen`)
    continue
  }
  if (postKeys.has(String(data.translation_key))) {
    skipped++
    console.log(`= blog/${data.slug} bestaat al`)
    continue
  }
  if (dryRun) {
    console.log(`+ blog/${data.slug}`, { ...data, body: `${String(data.body).length} tekens HTML` })
    continue
  }
  await createEntry('blog', data)
  postKeys.add(String(data.translation_key))
  created++
  console.log(`+ blog/${data.slug}`)
}

console.log(dryRun
  ? `Dry run: ${allProjects.length} projecten en ${allArticles.length} posts gelezen, niets aangemaakt.`
  : `Klaar: ${created} aangemaakt, ${updated} bijgewerkt, ${skipped} overgeslagen. Alles staat als concept in Centaur.`)
