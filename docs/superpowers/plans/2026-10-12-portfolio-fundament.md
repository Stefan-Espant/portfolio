# Portfolio redesign — Plan 1: Fundament en content

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De Nuxt-site vervangen door een WaldJS-project met geteste content-libraries (Centaur, i18n, GitHub), Centaur-collecties gevuld via een migratie uit DatoCMS, en een eerste tweetalige home in het nieuwe visuele systeem (donker, stenen achtergrond, Fraunces).

**Architecture:** WaldJS rendert alles tijdens de build. `src/lib/` bevat pure TypeScript-modules (getest met Vitest) die Centaur-entries naar view-modellen mappen en filteren op `locale`. Pagina-componenten in `src/components/pages/` krijgen een `locale`-prop, en dunne wrappers in `src/pages/` en `src/pages/en/` renderen ze. Globale CSS (fonts, tokens, base) wordt in de layout geïnlined, zoals bij Steva's Kookboek.

**Tech Stack:** WaldJS (`@waldjs/cli` 0.12), TypeScript, Vitest 5, tsx (scripts), marked (migratie), Centaur CMS REST API, DatoCMS GraphQL (alleen migratie), Node ≥ 22.

**Spec:** [2026-10-12-portfolio-redesign-design.md](../specs/2026-10-12-portfolio-redesign-design.md)

**Vervolgplannen** (worden geschreven nadat dit plan af is):
2. Pagina's: werk-overzicht, case study, blog, over (met cv-tijdlijn, skills en GitHub), contact, plus de EN-routes
3. Motion: `motion.js` met GSAP (parallax, hero, reveal, magnetic, rail, pinCase, transition, fraunces)
4. Afronden en publiceren: sitemap/robots/404 in de adapter, audits, README, Vercel, steefan.nl, webhooks

---

## Voordat je begint

- Werk op branch `redesign` (bestaat al en bevat de spec):
  ```bash
  cd /Users/stefan/Desktop/hva-FDND/portfolio
  git switch redesign
  ```
- Node ≥ 22 (`node --version` → v22.x).
- **Referentie-implementatie:** `/Users/stefan/Desktop/semantique-agency/repositories/Steva-s-Kookboek` gebruikt dezelfde stack. Kijk daar bij twijfel over WaldJS-syntax (`src/layouts/Layout.wald`, `src/components/RecipeCard.wald`, `src/lib/cms.ts`).
- **WaldJS in het kort:**
  - Een `.wald`-bestand heeft een frontmatter (TypeScript) tussen `---`-regels, dan een HTML-template.
  - Props komen binnen via `$$props`, gedeclareerd met `type Props = {…}`.
  - In templates staan **geen loops of if's**. Lijsten en voorwaardelijke stukken bouw je in de frontmatter als string met `renderTemplate` (een tagged template die escapet) en voeg je in met `{new SafeHtml(html)}`. `renderTemplate` en `SafeHtml` zijn globals, dus niet importeren.
  - Een component render je in de frontmatter met `await Component.render(props)`, of in het template als `<Component prop={x} />`.
  - Child-content van een layout komt binnen als `pond` en zet je neer met `{pond}`.
  - `<style>` in een component is scoped. HTML die als string in de frontmatter is gebouwd krijgt **geen** scope-attribuut, dus style die genest onder de (wel gescopete) buitenste selector, bijv. `.nav { & .nav__link {…} }`.
  - Dynamische routes: `src/pages/werk/[slug].wald` met `export async function getStaticPaths()`.
- **Geheimen:** `.env` staat in `.gitignore`. Commit nooit `.env` en print nooit token-waarden in logs.
- Sluit elke commit-message af met de regel `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. In de commando's hieronder is die regel kortheidshalve weggelaten.

## File map

| Bestand | Verantwoordelijkheid |
|---|---|
| `package.json`, `wald.config.ts`, `vitest.config.ts`, `.env.example`, `.gitignore` | Project-setup, `.env` laden, Vercel-adapter, test-config |
| `src/lib/cms.ts` | Centaur REST-client: `getCollection`, `getPage`, `getSiteSettings`, memoization, timeout |
| `src/lib/i18n.ts` | Locales, routes per taal (`localePath`), UI-woordenlijst (`t`), `langSwitchHref` |
| `src/lib/content.ts` | Entries → `Project`/`Post`/`Experience`/`Skill`, filteren op locale, vertalingen koppelen, loaders |
| `src/lib/github.ts` | Recente repos van Stefan-Espant, tijdens de build, faalt zacht (`null`) |
| `src/lib/site.ts` | `siteUrl()`, `absoluteUrl()` |
| `scripts/migrate/transform.ts` | Pure transformaties DatoCMS-record → Centaur-entry-data |
| `scripts/migrate-datocms.ts` | Eenmalige runner: DatoCMS lezen, media uploaden, entries aanmaken (idempotent, `--dry-run`) |
| `scripts/fetch-fonts.mjs` | Eenmalig: Fraunces en JetBrains Mono (latin, woff2) naar `public/fonts/` |
| `docs/centaur-collecties.md` | Exacte collectie- en veldslugs om in Centaur aan te maken |
| `src/styles/fonts.css`, `tokens.css`, `base.css` | `@font-face`, design tokens, reset/basis/steen/skip-link/focus |
| `src/layouts/Layout.wald` | `<head>` (SEO, canonical, hreflang), steen, nav, footer, inline CSS |
| `src/components/Nav.wald`, `Footer.wald` | Navigatie met taalwissel, footer |
| `src/components/pages/HomePage.wald` | Home (eerste versie: hero + uitgelichte projecten) |
| `src/pages/index.wald`, `src/pages/en/index.wald`, `src/pages/404.wald` | Routes |

## Veldslugs (afwijking van de spec)

De spec noemt velden in camelCase (`liveUrl`). In Centaur gebruiken we **snake_case** (`live_url`), net als Steva's Kookboek (`afbeelding_alt`). De mappers in `content.ts` vertalen naar camelCase. Verder geldt in dit plan:

- Lijsten (`stack`, `tags`) zijn een **tekstveld met komma's** (`"TypeScript, Vite, Node"`). Repeater-subvelden zijn in het Centaur-dashboard nog niet goed in te stellen.
- `gallery` is een optionele repeater (`image` + `alt`). Kan die nog niet in het dashboard, sla het veld dan over: de mapper geeft dan een lege lijst.
- **Toevoeging:** `design_url` (optioneel) voor de bestaande DatoCMS-waarde `urlDesign` (ontwerp-link).

---

### Task 1: Nuxt opruimen en assets verhuizen

**Files:**
- Delete: `app.vue`, `components/`, `composables/`, `layouts/`, `pages/`, `server/`, `nuxt.config.ts`, `tsconfig.json`, `package-lock.json`, `assets/`
- Move: stenen webp's, logo, portretfoto's → `public/images/`
- Modify: `.gitignore`

- [ ] **Step 1: Assets die we houden verhuizen**

```bash
cd /Users/stefan/Desktop/hva-FDND/portfolio
mkdir -p public/images/stone
git mv assets/images/stone-background/webp/stone-background-489x326.webp public/images/stone/stone-489.webp
git mv assets/images/stone-background/webp/stone-background-857x571.webp public/images/stone/stone-857.webp
git mv assets/images/stone-background/webp/stone-background-1400x933.webp public/images/stone/stone-1400.webp
git mv assets/images/logo-steefan.svg public/images/logo-steefan.svg
git mv assets/images/stefan public/images/stefan
```

- [ ] **Step 2: Nuxt-code en de rest van `assets/` verwijderen**

```bash
git rm -r -q app.vue components composables layouts pages server nuxt.config.ts tsconfig.json package-lock.json assets
rm -rf .nuxt .output dist node_modules
ls
```

Expected: `LICENSE README.md docs package.json public` (plus verborgen bestanden). `package.json` wordt in Task 2 overschreven.

- [ ] **Step 3: `.gitignore` vervangen**

Overschrijf `.gitignore` met:

```gitignore
# Node
node_modules

# WaldJS / Vercel build-output
.vercel
dist

# Gekopieerd door wald.config.ts (GSAP e.d.)
public/vendor

# Logs
*.log

# Misc
.DS_Store
.idea

# Local env files
.env
.env.*
!.env.example

# Brainstorm-mockups
.superpowers/
```

- [ ] **Step 4: Commit**

```bash
git add -A
git status --short | head -20   # alleen deletes, renames en .gitignore
git commit -m "chore: remove Nuxt app ahead of WaldJS rebuild"
```

---

### Task 2: WaldJS-project en testsetup

**Files:**
- Create: `package.json` (overschrijven), `wald.config.ts`, `vitest.config.ts`, `.env.example`, `src/pages/index.wald` (tijdelijk)
- Test: `src/lib/smoke.test.ts` (tijdelijk)

- [ ] **Step 1: `package.json` schrijven**

```json
{
  "name": "steefan-portfolio",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wald grow",
    "build": "node -e \"require('fs').rmSync('.vercel/output', { recursive: true, force: true })\" && wald build",
    "preview": "wald preview",
    "check": "wald check",
    "test": "vitest run",
    "migrate": "tsx scripts/migrate-datocms.ts",
    "fonts": "node scripts/fetch-fonts.mjs"
  },
  "dependencies": {
    "@waldjs/cli": "^0.12.1",
    "gsap": "^3.15.0"
  },
  "devDependencies": {
    "marked": "^18.1.1",
    "tsx": "^4.23.15",
    "vitest": "^5.0.4"
  },
  "engines": {
    "node": ">=22"
  }
}
```

- [ ] **Step 2: `wald.config.ts` schrijven**

```ts
import { existsSync, readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { defineConfig, vercelAdapter } from '@waldjs/cli'

// Lokaal staan de Centaur- en GitHub-gegevens in .env; op Vercel komen ze uit de project-env
// vars (die winnen, vandaar ??=). BOM strippen: sommige editors zetten er een voor.
if (existsSync('.env')) {
  const env = parseEnv(readFileSync('.env', 'utf8').replace(/^﻿/, ''))
  for (const [key, value] of Object.entries(env)) process.env[key] ??= value
}

export default defineConfig({
  adapter: vercelAdapter()
})
```

- [ ] **Step 3: `vitest.config.ts` schrijven**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts']
  }
})
```

- [ ] **Step 4: `.env.example` schrijven**

```bash
# Centaur CMS — lees-sleutel (production-environment), ook op Vercel
CENTAUR_API_BASE=https://api.centaur-cms.app
CENTAUR_API_KEY=jouw-lees-sleutel
CENTAUR_TENANT_SLUG=jouw-project-slug

# Alleen lokaal, voor scripts/migrate-datocms.ts: sleutel met schrijfrechten. Nooit op Vercel zetten.
CENTAUR_WRITE_KEY=jouw-schrijf-sleutel

# GitHub — optioneel, verhoogt de rate limit tijdens de build (alleen lees-rechten op public repos)
GITHUB_TOKEN=

# Alleen voor de migratie: read-only API-tokens van de twee DatoCMS-projecten
DATO_CMS_TOKEN=
DATO_BLOG_TOKEN=

# Publieke URL voor canonical/hreflang (op Vercel valt hij terug op het productiedomein)
SITE_URL=http://localhost:7233
```

- [ ] **Step 5: Tijdelijke pagina en smoke-test**

`src/pages/index.wald`:

```wald
---
const title = 'Steefan'
---
<!DOCTYPE html>
<html lang="nl">
  <head><meta charset="UTF-8" /><title>{title}</title></head>
  <body><h1>{title}</h1></body>
</html>
```

`src/lib/smoke.test.ts`:

```ts
import { expect, test } from 'vitest'

test('vitest draait', () => {
  expect(1 + 1).toBe(2)
})
```

- [ ] **Step 6: Installeren en controleren**

```bash
npm install
npm test
```

Expected: `1 passed`.

```bash
npm run dev &
sleep 4 && curl -s http://localhost:7233/ | grep -o '<h1>Steefan</h1>'
kill %1
```

Expected: `<h1>Steefan</h1>`. Draait de dev-server op een andere poort, gebruik dan de poort uit de output van `wald grow`.

- [ ] **Step 7: Smoke-test weghalen en committen**

```bash
rm src/lib/smoke.test.ts
git add -A
git commit -m "chore: scaffold WaldJS project with Vitest"
```

---

### Task 3: Centaur-client (`src/lib/cms.ts`)

**Files:**
- Create: `src/lib/cms.ts`
- Test: `src/lib/cms.test.ts`

- [ ] **Step 1: Failing tests schrijven**

`src/lib/cms.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { clearCmsCache, getCollection, getPage, getSiteSettings } from './cms'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('cms', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    process.env.CENTAUR_API_BASE = 'https://api.example.test/'
    process.env.CENTAUR_API_KEY = 'lees-sleutel'
    vi.stubGlobal('fetch', fetchMock)
    clearCmsCache()
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  test('getCollection haalt gepubliceerde entries op met de API-sleutel', async () => {
    fetchMock.mockResolvedValue(json([{ id: 'a', data: { title: 'WaldJS' } }]))

    const entries = await getCollection('projecten')

    expect(entries).toEqual([{ id: 'a', data: { title: 'WaldJS' } }])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.example.test/content/projecten')
    expect(init.headers).toEqual({ 'X-Api-Key': 'lees-sleutel' })
  })

  test('getCollection geeft een lege lijst als de collectie niet bestaat', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 404 }))
    await expect(getCollection('bestaat-niet')).resolves.toEqual([])
  })

  test('getCollection gooit bij een serverfout, zodat de build faalt', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 500 }))
    await expect(getCollection('projecten')).rejects.toThrow('Centaur /content/projecten gaf status 500')
  })

  test('getCollection vraagt dezelfde collectie maar één keer op', async () => {
    fetchMock.mockImplementation(async () => json([]))
    await Promise.all([getCollection('blog'), getCollection('blog')])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  test('getPage geeft null bij 404', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 404 }))
    await expect(getPage('bestaat-niet')).resolves.toBeNull()
  })

  test('getSiteSettings geeft de settings terug, en null bij een fout', async () => {
    fetchMock.mockResolvedValueOnce(json({ tenantSlug: 't', settings: { siteName: 'Steefan' } }))
    await expect(getSiteSettings()).resolves.toEqual({ siteName: 'Steefan' })

    clearCmsCache()
    fetchMock.mockResolvedValueOnce(new Response('', { status: 500 }))
    await expect(getSiteSettings()).resolves.toBeNull()
  })
})
```

- [ ] **Step 2: Tests draaien en zien falen**

Run: `npx vitest run src/lib/cms.test.ts`
Expected: FAIL, `Failed to resolve import "./cms"`.

- [ ] **Step 3: Implementatie schrijven**

`src/lib/cms.ts`:

```ts
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
  if (!cache.has(key)) cache.set(key, load())
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
```

- [ ] **Step 4: Tests draaien en zien slagen**

Run: `npx vitest run src/lib/cms.test.ts`
Expected: `6 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cms.ts src/lib/cms.test.ts
git commit -m "feat: add Centaur CMS client"
```

---

### Task 4: i18n (`src/lib/i18n.ts`)

**Files:**
- Create: `src/lib/i18n.ts`
- Test: `src/lib/i18n.test.ts`

- [ ] **Step 1: Failing tests schrijven**

`src/lib/i18n.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { LOCALES, isLocale, langSwitchHref, localePath, otherLocale, t } from './i18n'

describe('i18n', () => {
  test('ondersteunt nl en en', () => {
    expect(LOCALES).toEqual(['nl', 'en'])
    expect(isLocale('nl')).toBe(true)
    expect(isLocale('de')).toBe(false)
    expect(isLocale(undefined)).toBe(false)
    expect(otherLocale('nl')).toBe('en')
    expect(otherLocale('en')).toBe('nl')
  })

  test('localePath geeft NL zonder prefix en EN onder /en', () => {
    expect(localePath('home', 'nl')).toBe('/')
    expect(localePath('home', 'en')).toBe('/en')
    expect(localePath('work', 'nl')).toBe('/werk')
    expect(localePath('work', 'en')).toBe('/en/work')
    expect(localePath('about', 'nl')).toBe('/over')
    expect(localePath('about', 'en')).toBe('/en/about')
    expect(localePath('contact', 'en')).toBe('/en/contact')
  })

  test('localePath vult de slug in bij detailroutes', () => {
    expect(localePath('project', 'nl', 'waldjs')).toBe('/werk/waldjs')
    expect(localePath('project', 'en', 'waldjs')).toBe('/en/work/waldjs')
    expect(localePath('post', 'nl', 'mijn-post')).toBe('/blog/mijn-post')
    expect(localePath('post', 'en', 'my-post')).toBe('/en/blog/my-post')
  })

  test('localePath gooit als een detailroute geen slug krijgt', () => {
    expect(() => localePath('project', 'nl')).toThrow('Route "project" heeft een slug nodig')
  })

  test('t vertaalt per taal', () => {
    expect(t('nav.work', 'nl')).toBe('Werk')
    expect(t('nav.work', 'en')).toBe('Work')
  })

  test('langSwitchHref linkt naar de vertaling, of naar de home van de andere taal', () => {
    expect(langSwitchHref({ nl: '/werk/waldjs', en: '/en/work/waldjs' }, 'nl')).toBe('/en/work/waldjs')
    expect(langSwitchHref({ nl: '/blog/alleen-nl' }, 'nl')).toBe('/en')
    expect(langSwitchHref({}, 'en')).toBe('/')
  })
})
```

- [ ] **Step 2: Tests draaien en zien falen**

Run: `npx vitest run src/lib/i18n.test.ts`
Expected: FAIL, `Failed to resolve import "./i18n"`.

- [ ] **Step 3: Implementatie schrijven**

`src/lib/i18n.ts`:

```ts
// Talen, routes en UI-teksten. Nederlands staat zonder prefix, Engels onder /en.
// Content-teksten (projecten, posts) komen uit Centaur; hier alleen de vaste UI-teksten.

export const LOCALES = ['nl', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const isLocale = (value: unknown): value is Locale => LOCALES.includes(value as Locale)
export const otherLocale = (locale: Locale): Locale => (locale === 'nl' ? 'en' : 'nl')

export type RouteName = 'home' | 'work' | 'project' | 'blog' | 'post' | 'about' | 'contact'

const ROUTES: Record<RouteName, Record<Locale, string>> = {
  home: { nl: '/', en: '/en' },
  work: { nl: '/werk', en: '/en/work' },
  project: { nl: '/werk/:slug', en: '/en/work/:slug' },
  blog: { nl: '/blog', en: '/en/blog' },
  post: { nl: '/blog/:slug', en: '/en/blog/:slug' },
  about: { nl: '/over', en: '/en/about' },
  contact: { nl: '/contact', en: '/en/contact' }
}

export function localePath(route: RouteName, locale: Locale, slug?: string): string {
  const pattern = ROUTES[route][locale]
  if (!pattern.includes(':slug')) return pattern
  if (!slug) throw new Error(`Route "${route}" heeft een slug nodig`)
  return pattern.replace(':slug', encodeURIComponent(slug))
}

const nl = {
  'nav.label': 'Hoofdnavigatie',
  'nav.work': 'Werk',
  'nav.blog': 'Blog',
  'nav.about': 'Over',
  'nav.contact': 'Contact',
  'skip': 'Naar de inhoud',
  'lang.switch': 'English',
  'home.title': 'Steefan — developer en designer',
  'home.description': 'Portfolio van Stefan: maker van WaldJS en Centaur CMS, frontend developer en designer.',
  'home.heading': 'Ik bouw mijn eigen tools.',
  'home.lead': 'Framework-auteur, CMS-bouwer en frontend developer.',
  'home.featured': 'Uitgelicht werk',
  'home.empty': 'Hier verschijnen binnenkort de projecten.',
  'footer.text': 'Gebouwd met WaldJS, GSAP en Centaur CMS.',
  'notFound.title': 'Pagina niet gevonden',
  'notFound.body': 'Deze pagina bestaat niet (meer).',
  'notFound.back': 'Terug naar home'
} as const

export type MessageKey = keyof typeof nl

const en: Record<MessageKey, string> = {
  'nav.label': 'Main navigation',
  'nav.work': 'Work',
  'nav.blog': 'Blog',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'skip': 'Skip to content',
  'lang.switch': 'Nederlands',
  'home.title': 'Steefan — developer and designer',
  'home.description': 'Portfolio of Stefan: creator of WaldJS and Centaur CMS, frontend developer and designer.',
  'home.heading': 'I build my own tools.',
  'home.lead': 'Framework author, CMS builder and frontend developer.',
  'home.featured': 'Featured work',
  'home.empty': 'Projects will appear here soon.',
  'footer.text': 'Built with WaldJS, GSAP and Centaur CMS.',
  'notFound.title': 'Page not found',
  'notFound.body': 'This page does not exist (anymore).',
  'notFound.back': 'Back to home'
}

const MESSAGES: Record<Locale, Record<MessageKey, string>> = { nl, en }

export function t(key: MessageKey, locale: Locale): string {
  return MESSAGES[locale][key]
}

/** Taalwissel: naar dezelfde pagina in de andere taal, of naar die home als er geen vertaling is. */
export function langSwitchHref(alternates: Partial<Record<Locale, string>>, locale: Locale): string {
  const other = otherLocale(locale)
  return alternates[other] ?? localePath('home', other)
}
```

- [ ] **Step 4: Tests draaien en zien slagen**

Run: `npx vitest run src/lib/i18n.test.ts`
Expected: `6 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n.ts src/lib/i18n.test.ts
git commit -m "feat: add i18n routes and UI messages"
```

---

### Task 5: Content-mappers (`src/lib/content.ts`, deel 1)

**Files:**
- Create: `src/lib/content.ts`
- Test: `src/lib/content.test.ts`

- [ ] **Step 1: Failing tests schrijven**

`src/lib/content.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import type { CentaurEntry } from './cms'
import { forLocale, missingTranslations, toExperience, toPost, toProject, toSkill, translationsOf } from './content'

const entry = (data: Record<string, unknown>, id = 'e1'): CentaurEntry => ({
  id,
  data,
  status: 'published',
  publishedAt: '2026-10-01T00:00:00Z',
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-02T00:00:00Z'
})

const waldNl = {
  locale: 'nl',
  translation_key: 'waldjs',
  slug: 'waldjs',
  title: 'WaldJS',
  summary: 'Static-first framework.',
  type: 'framework',
  featured: true,
  order: 1,
  year: 2026,
  stack: 'TypeScript, Vite , Node',
  cover: 'https://cdn.example/wald.png',
  problem: '<p>Probleem</p>',
  approach: '<p>Aanpak</p>',
  result: '<p>Resultaat</p>',
  gallery: [{ image: 'https://cdn.example/1.png', alt: 'Eén' }, { image: '', alt: 'leeg' }],
  live_url: 'https://waldjs.eu',
  repo_url: 'https://github.com/Stefan-Espant/WaldJS',
  npm_package: '@waldjs/cli'
}

describe('toProject', () => {
  test('mapt alle velden naar camelCase', () => {
    expect(toProject(entry(waldNl))).toEqual({
      id: 'e1',
      locale: 'nl',
      translationKey: 'waldjs',
      slug: 'waldjs',
      title: 'WaldJS',
      summary: 'Static-first framework.',
      type: 'framework',
      featured: true,
      order: 1,
      year: 2026,
      client: '',
      stack: ['TypeScript', 'Vite', 'Node'],
      cover: 'https://cdn.example/wald.png',
      coverAlt: 'WaldJS',
      problemHtml: '<p>Probleem</p>',
      approachHtml: '<p>Aanpak</p>',
      resultHtml: '<p>Resultaat</p>',
      gallery: [{ src: 'https://cdn.example/1.png', alt: 'Eén' }],
      liveUrl: 'https://waldjs.eu',
      repoUrl: 'https://github.com/Stefan-Espant/WaldJS',
      designUrl: '',
      npmPackage: '@waldjs/cli'
    })
  })

  test('valt terug op type "website" bij een onbekend type', () => {
    expect(toProject(entry({ ...waldNl, type: 'iets' }))?.type).toBe('website')
  })

  test('geeft null zonder locale, translation_key, slug of titel', () => {
    expect(toProject(entry({ ...waldNl, locale: 'de' }))).toBeNull()
    expect(toProject(entry({ ...waldNl, translation_key: '' }))).toBeNull()
    expect(toProject(entry({ ...waldNl, slug: '' }))).toBeNull()
    expect(toProject(entry({ ...waldNl, title: '  ' }))).toBeNull()
  })
})

describe('toPost', () => {
  test('mapt een blogpost', () => {
    expect(toPost(entry({
      locale: 'en',
      translation_key: 'hallo',
      slug: 'hello',
      title: 'Hello',
      excerpt: 'Kort.',
      body: '<p>Body</p>',
      published_at: '2024-05-01',
      tags: 'css, a11y'
    }))).toEqual({
      id: 'e1',
      locale: 'en',
      translationKey: 'hallo',
      slug: 'hello',
      title: 'Hello',
      excerpt: 'Kort.',
      bodyHtml: '<p>Body</p>',
      cover: '',
      coverAlt: 'Hello',
      publishedAt: '2024-05-01',
      tags: ['css', 'a11y']
    })
  })

  test('geeft null zonder slug of titel', () => {
    expect(toPost(entry({ locale: 'nl', translation_key: 'x', slug: '', title: 'X' }))).toBeNull()
  })
})

describe('toExperience', () => {
  test('mapt ervaring en kiest standaard "werk"', () => {
    expect(toExperience(entry({
      locale: 'nl',
      translation_key: 'hva',
      role: 'Student FDND',
      organisation: 'HvA',
      start: '2023-09-01',
      end: '',
      description: '<p>Opleiding</p>',
      kind: 'opleiding'
    }))).toEqual({
      id: 'e1',
      locale: 'nl',
      translationKey: 'hva',
      slug: '',
      role: 'Student FDND',
      organisation: 'HvA',
      start: '2023-09-01',
      end: '',
      descriptionHtml: '<p>Opleiding</p>',
      kind: 'opleiding'
    })
    expect(toExperience(entry({ locale: 'nl', translation_key: 'x', role: 'Dev', kind: '?' }))?.kind).toBe('werk')
  })

  test('geeft null zonder rol', () => {
    expect(toExperience(entry({ locale: 'nl', translation_key: 'x', role: '' }))).toBeNull()
  })
})

describe('toSkill', () => {
  test('mapt een skill', () => {
    expect(toSkill(entry({ locale: 'en', translation_key: 'ts', name: 'TypeScript', category: 'frontend', order: '2' }))).toEqual({
      id: 'e1',
      locale: 'en',
      translationKey: 'ts',
      slug: '',
      name: 'TypeScript',
      category: 'frontend',
      order: 2
    })
  })
})

describe('locale-helpers', () => {
  const nl = toProject(entry(waldNl, 'a'))!
  const en = toProject(entry({ ...waldNl, locale: 'en', slug: 'waldjs-en' }, 'b'))!
  const alleenNl = toProject(entry({ ...waldNl, translation_key: 'oud', slug: 'oud' }, 'c'))!
  const items = [nl, en, alleenNl]

  test('forLocale filtert op taal', () => {
    expect(forLocale(items, 'en')).toEqual([en])
  })

  test('translationsOf koppelt vertalingen via translationKey', () => {
    expect(translationsOf(items, 'waldjs')).toEqual({ nl, en })
    expect(translationsOf(items, 'oud')).toEqual({ nl: alleenNl })
  })

  test('missingTranslations meldt items zonder vertaling', () => {
    expect(missingTranslations(items)).toEqual([{ translationKey: 'oud', missing: ['en'] }])
  })
})
```

- [ ] **Step 2: Tests draaien en zien falen**

Run: `npx vitest run src/lib/content.test.ts`
Expected: FAIL, `Failed to resolve import "./content"`.

- [ ] **Step 3: Implementatie schrijven**

`src/lib/content.ts`:

```ts
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
```

- [ ] **Step 4: Tests draaien en zien slagen**

Run: `npx vitest run src/lib/content.test.ts`
Expected: `11 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content.ts src/lib/content.test.ts
git commit -m "feat: map Centaur entries to localized content models"
```

---

### Task 6: Content-loaders (`src/lib/content.ts`, deel 2)

**Files:**
- Modify: `src/lib/content.ts` (import en loaders toevoegen)
- Test: `src/lib/content-loaders.test.ts`

- [ ] **Step 1: Failing tests schrijven**

`src/lib/content-loaders.test.ts`:

```ts
import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('./cms', () => ({ getCollection: vi.fn() }))

import { getCollection } from './cms'
import {
  clearContentCache,
  getExperience,
  getFeaturedProjects,
  getPost,
  getPosts,
  getProject,
  getProjects,
  getSkills,
  postAlternates,
  projectAlternates
} from './content'

const entry = (id: string, data: Record<string, unknown>) => ({
  id, data, status: 'published', publishedAt: null, createdAt: '', updatedAt: ''
})

const collections: Record<string, ReturnType<typeof entry>[]> = {
  projecten: [
    entry('p1', { locale: 'nl', translation_key: 'wald', slug: 'waldjs', title: 'WaldJS', featured: true, order: 2, year: 2026 }),
    entry('p2', { locale: 'nl', translation_key: 'centaur', slug: 'centaur-cms', title: 'Centaur CMS', featured: true, order: 1, year: 2026 }),
    entry('p3', { locale: 'nl', translation_key: 'oud', slug: 'oud-project', title: 'Oud', featured: false, order: 0, year: 2023 }),
    entry('p4', { locale: 'en', translation_key: 'wald', slug: 'waldjs', title: 'WaldJS', featured: true, order: 2, year: 2026 }),
    entry('p5', { locale: 'nl', translation_key: 'kapot', slug: '', title: 'Zonder slug' })
  ],
  blog: [
    entry('b1', { locale: 'nl', translation_key: 'a', slug: 'eerste', title: 'Eerste', published_at: '2024-01-10' }),
    entry('b2', { locale: 'nl', translation_key: 'b', slug: 'tweede', title: 'Tweede', published_at: '2025-03-02' }),
    entry('b3', { locale: 'en', translation_key: 'b', slug: 'second', title: 'Second', published_at: '2025-03-02' })
  ],
  ervaring: [
    entry('x1', { locale: 'nl', translation_key: 'hva', role: 'Student', start: '2023-09-01' }),
    entry('x2', { locale: 'nl', translation_key: 'semantique', role: 'Developer', start: '2025-02-01' })
  ],
  skills: [
    entry('s1', { locale: 'nl', translation_key: 'css', name: 'CSS', category: 'frontend', order: 2 }),
    entry('s2', { locale: 'nl', translation_key: 'figma', name: 'Figma', category: 'design', order: 1 }),
    entry('s3', { locale: 'nl', translation_key: 'html', name: 'HTML', category: 'frontend', order: 1 })
  ]
}

describe('content-loaders', () => {
  beforeEach(() => {
    clearContentCache()
    vi.mocked(getCollection).mockClear()
    vi.mocked(getCollection).mockImplementation(async slug => collections[slug] ?? [])
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  test('getProjects: alleen de gevraagde taal, featured eerst, dan op order', async () => {
    const projects = await getProjects('nl')
    expect(projects.map(p => p.slug)).toEqual(['centaur-cms', 'waldjs', 'oud-project'])
  })

  test('slaat entries zonder verplichte velden over en waarschuwt', async () => {
    await getProjects('nl')
    expect(console.warn).toHaveBeenCalledWith('⚠ projecten: entry p5 mist verplichte velden en wordt overgeslagen')
  })

  test('waarschuwt voor ontbrekende vertalingen', async () => {
    await getProjects('nl')
    expect(console.warn).toHaveBeenCalledWith('⚠ projecten: "centaur" heeft geen vertaling in en')
  })

  test('getFeaturedProjects en getProject', async () => {
    expect((await getFeaturedProjects('nl')).map(p => p.slug)).toEqual(['centaur-cms', 'waldjs'])
    expect((await getProject('waldjs', 'en'))?.id).toBe('p4')
    expect(await getProject('bestaat-niet', 'nl')).toBeNull()
  })

  test('projectAlternates geeft de paden van alle vertalingen', async () => {
    const project = (await getProject('waldjs', 'nl'))!
    expect(await projectAlternates(project)).toEqual({ nl: '/werk/waldjs', en: '/en/work/waldjs' })
  })

  test('getPosts: nieuwste eerst; getPost en postAlternates', async () => {
    expect((await getPosts('nl')).map(p => p.slug)).toEqual(['tweede', 'eerste'])
    const post = (await getPost('tweede', 'nl'))!
    expect(await postAlternates(post)).toEqual({ nl: '/blog/tweede', en: '/en/blog/second' })
  })

  test('getExperience: nieuwste eerst', async () => {
    expect((await getExperience('nl')).map(e => e.translationKey)).toEqual(['semantique', 'hva'])
  })

  test('getSkills: op categorie, dan order', async () => {
    expect((await getSkills('nl')).map(s => s.name)).toEqual(['Figma', 'HTML', 'CSS'])
  })

  test('vraagt elke collectie maar één keer op', async () => {
    await Promise.all([getProjects('nl'), getProjects('en'), getFeaturedProjects('nl')])
    expect(vi.mocked(getCollection).mock.calls.filter(([slug]) => slug === 'projecten')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Tests draaien en zien falen**

Run: `npx vitest run src/lib/content-loaders.test.ts`
Expected: FAIL, `clearContentCache is not a function` (of een vergelijkbare export-fout).

- [ ] **Step 3: Loaders toevoegen aan `src/lib/content.ts`**

Vervang de eerste twee import-regels bovenaan door:

```ts
import { getCollection, type CentaurEntry } from './cms'
import { LOCALES, isLocale, localePath, type Locale } from './i18n'
```

Voeg onderaan het bestand toe:

```ts
// ── Loaders ──────────────────────────────────────────────────────────────────────────────
// Elke collectie wordt per build één keer opgehaald en gemapt. Entries zonder verplichte
// velden en ontbrekende vertalingen komen als waarschuwing in de build-log.

const loaded = new Map<string, Promise<Localized[]>>()

function load<T extends Localized>(collection: string, map: (entry: CentaurEntry) => T | null): Promise<T[]> {
  if (!loaded.has(collection)) {
    loaded.set(collection, (async () => {
      const items: T[] = []
      for (const entry of await getCollection(collection)) {
        const item = map(entry)
        if (item) items.push(item)
        else console.warn(`⚠ ${collection}: entry ${entry.id} mist verplichte velden en wordt overgeslagen`)
      }
      for (const { translationKey, missing } of missingTranslations(items)) {
        console.warn(`⚠ ${collection}: "${translationKey}" heeft geen vertaling in ${missing.join(', ')}`)
      }
      return items
    })())
  }
  return loaded.get(collection) as Promise<T[]>
}

export function clearContentCache(): void {
  loaded.clear()
}

const loadProjects = () => load('projecten', toProject)
const loadPosts = () => load('blog', toPost)

const byProjectOrder = (a: Project, b: Project) =>
  Number(b.featured) - Number(a.featured) || a.order - b.order || b.year - a.year

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

export async function getExperience(locale: Locale): Promise<Experience[]> {
  return forLocale(await load('ervaring', toExperience), locale).sort((a, b) => b.start.localeCompare(a.start))
}

export async function getSkills(locale: Locale): Promise<Skill[]> {
  return forLocale(await load('skills', toSkill), locale)
    .sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order)
}
```

- [ ] **Step 4: Alle content-tests draaien**

Run: `npx vitest run src/lib/content.test.ts src/lib/content-loaders.test.ts`
Expected: `20 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content.ts src/lib/content-loaders.test.ts
git commit -m "feat: add localized content loaders"
```

---

### Task 7: GitHub-data (`src/lib/github.ts`) en site-URL (`src/lib/site.ts`)

**Files:**
- Create: `src/lib/github.ts`, `src/lib/site.ts`
- Test: `src/lib/github.test.ts`, `src/lib/site.test.ts`

- [ ] **Step 1: Failing tests schrijven**

`src/lib/github.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { clearGithubCache, getRecentRepos, toRepos } from './github'

const raw = [
  { name: 'oud', description: null, html_url: 'https://github.com/x/oud', language: 'Vue', stargazers_count: 1, pushed_at: '2024-01-01T00:00:00Z', fork: false, archived: false },
  { name: 'WaldJS', description: 'Framework', html_url: 'https://github.com/x/WaldJS', language: 'TypeScript', stargazers_count: 12, pushed_at: '2026-10-10T00:00:00Z', fork: false, archived: false },
  { name: 'fork', html_url: 'https://github.com/x/fork', pushed_at: '2026-10-11T00:00:00Z', fork: true, archived: false },
  { name: 'archief', html_url: 'https://github.com/x/archief', pushed_at: '2026-10-11T00:00:00Z', fork: false, archived: true }
]

describe('toRepos', () => {
  test('zonder forks en archief, nieuwste eerst, met limiet', () => {
    expect(toRepos(raw, 6)).toEqual([
      { name: 'WaldJS', description: 'Framework', url: 'https://github.com/x/WaldJS', language: 'TypeScript', stars: 12, pushedAt: '2026-10-10T00:00:00Z' },
      { name: 'oud', description: '', url: 'https://github.com/x/oud', language: 'Vue', stars: 1, pushedAt: '2024-01-01T00:00:00Z' }
    ])
    expect(toRepos(raw, 1)).toHaveLength(1)
    expect(toRepos({ message: 'rate limit' })).toEqual([])
  })
})

describe('getRecentRepos', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    clearGithubCache()
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    delete process.env.GITHUB_TOKEN
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  test('haalt repos op, met token als die er is', async () => {
    process.env.GITHUB_TOKEN = 'geheim'
    fetchMock.mockResolvedValue(new Response(JSON.stringify(raw), { status: 200 }))

    const repos = await getRecentRepos()

    expect(repos?.map(repo => repo.name)).toEqual(['WaldJS', 'oud'])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.github.com/users/Stefan-Espant/repos?per_page=100&sort=pushed')
    expect(init.headers.Authorization).toBe('Bearer geheim')
  })

  test('geeft null en waarschuwt bij een fout, zodat de sectie wegvalt', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 403 }))

    await expect(getRecentRepos()).resolves.toBeNull()
    expect(console.warn).toHaveBeenCalledWith('⚠ GitHub: repos ophalen mislukt (status 403), sectie wordt overgeslagen')
  })
})
```

`src/lib/site.test.ts`:

```ts
import { afterEach, expect, test } from 'vitest'
import { absoluteUrl, siteUrl } from './site'

afterEach(() => {
  delete process.env.SITE_URL
  delete process.env.VERCEL_PROJECT_PRODUCTION_URL
})

test('siteUrl gebruikt SITE_URL, anders het Vercel-productiedomein', () => {
  process.env.SITE_URL = 'https://steefan.nl/'
  expect(siteUrl()).toBe('https://steefan.nl')
  delete process.env.SITE_URL
  process.env.VERCEL_PROJECT_PRODUCTION_URL = 'steefan.vercel.app'
  expect(siteUrl()).toBe('https://steefan.vercel.app')
})

test('absoluteUrl maakt alleen paden absoluut', () => {
  process.env.SITE_URL = 'https://steefan.nl'
  expect(absoluteUrl('/werk')).toBe('https://steefan.nl/werk')
  expect(absoluteUrl('https://cdn.example/a.png')).toBe('https://cdn.example/a.png')
})
```

- [ ] **Step 2: Tests draaien en zien falen**

Run: `npx vitest run src/lib/github.test.ts src/lib/site.test.ts`
Expected: FAIL, `Failed to resolve import "./github"` en `"./site"`.

- [ ] **Step 3: Implementatie schrijven**

`src/lib/github.ts`:

```ts
// Recente publieke repos van Stefan-Espant, opgehaald tijdens de build. Het token (optioneel,
// voor een hogere rate limit) blijft in Node. Mislukt het ophalen, dan geeft dit null en laat
// de over-pagina de GitHub-sectie weg: de build faalt er niet op.

export interface Repo {
  name: string
  description: string
  url: string
  language: string
  stars: number
  pushedAt: string
}

const USER = 'Stefan-Espant'

type RawRepo = Record<string, unknown>
const str = (value: unknown) => (typeof value === 'string' ? value : '')

export function toRepos(raw: unknown, limit = 6): Repo[] {
  if (!Array.isArray(raw)) return []
  return (raw as RawRepo[])
    .filter(repo => repo && !repo.fork && !repo.archived && typeof repo.name === 'string')
    .map(repo => ({
      name: str(repo.name),
      description: str(repo.description),
      url: str(repo.html_url),
      language: str(repo.language),
      stars: Number(repo.stargazers_count) || 0,
      pushedAt: str(repo.pushed_at)
    }))
    .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt))
    .slice(0, limit)
}

let cached: Promise<Repo[] | null> | null = null

export function clearGithubCache(): void {
  cached = null
}

export function getRecentRepos(limit = 6): Promise<Repo[] | null> {
  cached ??= (async () => {
    try {
      const token = process.env.GITHUB_TOKEN
      const response = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, {
        headers: { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        signal: AbortSignal.timeout(8000)
      })
      if (!response.ok) throw new Error(`status ${response.status}`)
      return toRepos(await response.json(), limit)
    } catch (error) {
      console.warn(`⚠ GitHub: repos ophalen mislukt (${(error as Error).message}), sectie wordt overgeslagen`)
      return null
    }
  })()
  return cached
}
```

`src/lib/site.ts`:

```ts
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
```

- [ ] **Step 4: Tests draaien en zien slagen**

Run: `npx vitest run src/lib/github.test.ts src/lib/site.test.ts`
Expected: `5 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/github.ts src/lib/github.test.ts src/lib/site.ts src/lib/site.test.ts
git commit -m "feat: add build-time GitHub repos and site URL helpers"
```

---

### Task 8: Centaur-collecties en API-sleutels (handmatig, Stefan)

Deze taak vraagt handelingen in het Centaur-dashboard. Een subagent schrijft alleen het document (Step 1). **Steps 2–4 doet Stefan zelf.** Ga pas verder met Task 10 als die klaar zijn.

**Files:**
- Create: `docs/centaur-collecties.md`

- [ ] **Step 1: Document schrijven**

`docs/centaur-collecties.md`:

````markdown
# Centaur-collecties voor het portfolio

De slugs van collecties en velden moeten **exact** zo heten: `src/lib/content.ts` leest ze zo uit.
Aanmaken: Centaur → **Collecties** → nieuwe collectie, als **Admin**.

Elke collectie heeft deze twee velden voor tweetaligheid:

| Veld (naam) | Slug | Type | Verplicht | Toelichting |
|---|---|---|---|---|
| Taal | `locale` | Tekst | ✓ | `nl` of `en` |
| Vertaalsleutel | `translation_key` | Tekst | ✓ | Zelfde waarde voor de NL- en EN-versie van één item, bv. `waldjs` |

Per taal maak je een aparte entry. Lijsten (`stack`, `tags`) zijn tekst met komma's: `TypeScript, Vite, Node`.

## `projecten` (naam: Projecten)

| Veld (naam) | Slug | Type | Verplicht | Toelichting |
|---|---|---|---|---|
| Titel | `title` | Tekst | ✓ | |
| Slug | `slug` | Tekst | ✓ | URL: `/werk/<slug>` of `/en/work/<slug>`; kleine letters en koppeltekens |
| Samenvatting | `summary` | Tekst | | 1–2 zinnen voor kaarten |
| Type | `type` | Tekst | | `framework`, `product`, `website` of `school` |
| Uitgelicht | `featured` | Boolean | | Komt in de bento op de home |
| Volgorde | `order` | Getal | | Laag = eerst |
| Jaar | `year` | Getal | | |
| Klant | `client` | Tekst | | |
| Stack | `stack` | Tekst | | Komma-gescheiden |
| Cover | `cover` | Media | | Liggend, minstens 1600 px breed |
| Alt-tekst cover | `cover_alt` | Tekst | | Leeg = de titel |
| Probleem | `problem` | Richtext | | Case study |
| Aanpak | `approach` | Richtext | | Case study |
| Resultaat | `result` | Richtext | | Case study |
| Galerij | `gallery` | Repeater | | Subvelden `image` (Media) en `alt` (Tekst). Overslaan als repeaters nog niet in te stellen zijn |
| Live-URL | `live_url` | Tekst | | |
| Repo-URL | `repo_url` | Tekst | | |
| Ontwerp-URL | `design_url` | Tekst | | Bv. Figma |
| npm-pakket | `npm_package` | Tekst | | Bv. `@waldjs/cli` |

## `blog` (naam: Blog)

| Veld (naam) | Slug | Type | Verplicht | Toelichting |
|---|---|---|---|---|
| Titel | `title` | Tekst | ✓ | |
| Slug | `slug` | Tekst | ✓ | URL: `/blog/<slug>` of `/en/blog/<slug>` |
| Intro | `excerpt` | Tekst | | ±160 tekens, ook de meta-omschrijving |
| Tekst | `body` | Richtext | ✓ | |
| Cover | `cover` | Media | | |
| Alt-tekst cover | `cover_alt` | Tekst | | |
| Publicatiedatum | `published_at` | Datum | ✓ | |
| Tags | `tags` | Tekst | | Komma-gescheiden |

## `ervaring` (naam: Ervaring)

| Veld (naam) | Slug | Type | Verplicht | Toelichting |
|---|---|---|---|---|
| Rol | `role` | Tekst | ✓ | |
| Organisatie | `organisation` | Tekst | | |
| Start | `start` | Datum | ✓ | |
| Einde | `end` | Datum | | Leeg = heden |
| Omschrijving | `description` | Richtext | | |
| Soort | `kind` | Tekst | | `werk` of `opleiding` |

## `skills` (naam: Skills)

| Veld (naam) | Slug | Type | Verplicht | Toelichting |
|---|---|---|---|---|
| Naam | `name` | Tekst | ✓ | |
| Categorie | `category` | Tekst | | Bv. `frontend`, `backend`, `design`, `tools` |
| Volgorde | `order` | Getal | | Binnen de categorie |

## API-sleutels

Onder **API-sleutels**, beide voor de environment `production`:

- **Lees-sleutel** → `CENTAUR_API_KEY` in `.env` en later op Vercel.
- **Schrijf-sleutel** (scope Content write) → `CENTAUR_WRITE_KEY`, **alleen** in de lokale `.env` voor de migratie. Trek hem na de migratie in.
````

- [ ] **Step 2 (Stefan): Collecties aanmaken** volgens `docs/centaur-collecties.md`.

- [ ] **Step 3 (Stefan): API-sleutels en tokens in `.env` zetten**

Vul in `.env` (zie `.env.example`): `CENTAUR_API_BASE`, `CENTAUR_API_KEY`, `CENTAUR_TENANT_SLUG`, `CENTAUR_WRITE_KEY`, `DATO_BLOG_TOKEN` (read-only API-token uit het DatoCMS-project van de i-love-web-app: Settings → API tokens). `DATO_CMS_TOKEN` en `GITHUB_TOKEN` staan er al.

Controle zonder waarden te tonen:

```bash
grep -oE '^[A-Z_]+=.' .env | cut -d= -f1
```

Expected: alle bovenstaande namen staan in de lijst.

- [ ] **Step 4: Commit het document**

```bash
git add docs/centaur-collecties.md
git commit -m "docs: document Centaur collections for the portfolio"
```

---

### Task 9: Migratie-transformaties (`scripts/migrate/transform.ts`)

**Files:**
- Create: `scripts/migrate/transform.ts`
- Test: `scripts/migrate/transform.test.ts`

- [ ] **Step 1: Failing tests schrijven**

`scripts/migrate/transform.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { articleToEntry, projectToEntry, slugify } from './transform'

describe('slugify', () => {
  test('kleine letters, zonder accenten, koppeltekens', () => {
    expect(slugify('Café de Flore — Redesign!')).toBe('cafe-de-flore-redesign')
    expect(slugify('  Tulp Talk  ')).toBe('tulp-talk')
  })
})

describe('projectToEntry', () => {
  test('zet een DatoCMS-project om naar een NL-concept voor Centaur', () => {
    expect(projectToEntry({
      id: '1',
      heading: 'Tulp Talk',
      client: 'FDND',
      date: '2024-03-15',
      url: 'https://tulp.example',
      urlDesign: 'https://figma.com/file/x',
      image: { url: 'https://dato.example/tulp.png', alt: '' }
    }, 'https://centaur.example/media/tulp.png')).toEqual({
      locale: 'nl',
      translation_key: 'tulp-talk',
      slug: 'tulp-talk',
      title: 'Tulp Talk',
      type: 'school',
      featured: false,
      order: 100,
      year: 2024,
      client: 'FDND',
      cover: 'https://centaur.example/media/tulp.png',
      cover_alt: 'Tulp Talk',
      live_url: 'https://tulp.example',
      design_url: 'https://figma.com/file/x'
    })
  })

  test('laat lege velden weg', () => {
    const entry = projectToEntry({ id: '2', heading: 'Leeg', client: null, date: null, url: null, urlDesign: null, image: null }, '')
    expect(entry).toEqual({
      locale: 'nl', translation_key: 'leeg', slug: 'leeg', title: 'Leeg', type: 'school', featured: false, order: 100, cover_alt: 'Leeg'
    })
  })
})

describe('articleToEntry', () => {
  test('zet markdown om naar HTML en maakt een intro', () => {
    const entry = articleToEntry({
      id: '9',
      title: 'Mijn eerste post',
      datum: '2024-02-01',
      paragraaf: 'Hallo **wereld**.\n\nTweede alinea.',
      _createdAt: '2024-02-03T10:00:00Z'
    })
    expect(entry).toEqual({
      locale: 'nl',
      translation_key: 'mijn-eerste-post',
      slug: 'mijn-eerste-post',
      title: 'Mijn eerste post',
      excerpt: 'Hallo wereld. Tweede alinea.',
      body: '<p>Hallo <strong>wereld</strong>.</p>\n<p>Tweede alinea.</p>\n',
      published_at: '2024-02-01'
    })
  })

  test('valt terug op _createdAt en kort lange intro’s af op een woordgrens', () => {
    const entry = articleToEntry({ id: '10', title: 'Lang', datum: null, paragraaf: 'woord '.repeat(60), _createdAt: '2023-11-20T08:00:00Z' })
    expect(entry.published_at).toBe('2023-11-20')
    expect(String(entry.excerpt).length).toBeLessThanOrEqual(161)
    expect(String(entry.excerpt).endsWith('woord…')).toBe(true)
  })
})
```

- [ ] **Step 2: Tests draaien en zien falen**

Run: `npx vitest run scripts/migrate/transform.test.ts`
Expected: FAIL, `Failed to resolve import "./transform"`.

- [ ] **Step 3: Implementatie schrijven**

`scripts/migrate/transform.ts`:

```ts
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
```

- [ ] **Step 4: Tests draaien en zien slagen**

Run: `npx vitest run scripts/migrate/transform.test.ts`
Expected: `5 passed`.

Faalt alleen de `body`-verwachting op witruimte (de exacte uitvoer van marked), pas dan de verwachte string in de test aan naar de echte uitvoer van `marked.parse`. Het gaat om de vorm `<p>…<strong>…</strong>…</p>`.

- [ ] **Step 5: Commit**

```bash
git add scripts/migrate/transform.ts scripts/migrate/transform.test.ts
git commit -m "feat: add DatoCMS to Centaur migration transforms"
```

---

### Task 10: Migratie-runner en migratie draaien

Vereist dat Task 8 Steps 2–3 klaar zijn.

**Files:**
- Create: `scripts/migrate-datocms.ts`

- [ ] **Step 1: Runner schrijven**

`scripts/migrate-datocms.ts`:

```ts
// Eenmalige migratie: projecten (portfolio-DatoCMS) en blogposts (i-love-web-DatoCMS) → Centaur,
// als NL-concepten. Idempotent: items waarvan de translation_key al bestaat worden overgeslagen.
//
// Gebruik:  npm run migrate -- --dry-run   (alleen tonen wat er zou gebeuren)
//           npm run migrate                (echt aanmaken)
import { existsSync, readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { articleToEntry, projectToEntry, type DatoArticle, type DatoProject, type EntryData } from './migrate/transform'

if (existsSync('.env')) {
  const env = parseEnv(readFileSync('.env', 'utf8').replace(/^﻿/, ''))
  for (const [key, value] of Object.entries(env)) process.env[key] ??= value
}

const dryRun = process.argv.includes('--dry-run')
const missing = ['DATO_CMS_TOKEN', 'DATO_BLOG_TOKEN', 'CENTAUR_API_BASE', 'CENTAUR_WRITE_KEY'].filter(key => !process.env[key])
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

async function existingKeys(collection: string): Promise<Set<string>> {
  const entries = await centaur<Array<{ data: Record<string, unknown> }>>(`/api/manage/collections/${collection}/entries`)
  return new Set(entries.map(entry => String(entry.data.translation_key ?? '')))
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

const { allProjects } = await dato<{ allProjects: DatoProject[] }>(
  process.env.DATO_CMS_TOKEN!,
  '{ allProjects(first: 100) { id heading client date url urlDesign image { url alt } } }'
)
const { allArticles } = await dato<{ allArticles: DatoArticle[] }>(
  process.env.DATO_BLOG_TOKEN!,
  '{ allArticles(first: 100) { id title datum paragraaf _createdAt } }'
)
const [projectKeys, postKeys] = await Promise.all([existingKeys('projecten'), existingKeys('blog')])

let created = 0
let skipped = 0

for (const project of allProjects) {
  const preview = projectToEntry(project, '')
  if (projectKeys.has(String(preview.translation_key))) {
    skipped++
    console.log(`= projecten/${preview.slug} bestaat al`)
    continue
  }
  if (dryRun) {
    console.log(`+ projecten/${preview.slug}`, preview)
    continue
  }
  const cover = project.image?.url ? await uploadImage(project.image.url, project.image.alt || project.heading) : ''
  await createEntry('projecten', projectToEntry(project, cover))
  projectKeys.add(String(preview.translation_key))
  created++
  console.log(`+ projecten/${preview.slug}`)
}

for (const article of allArticles) {
  const data = articleToEntry(article)
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
  : `Klaar: ${created} aangemaakt, ${skipped} overgeslagen. Alles staat als concept in Centaur.`)
```

- [ ] **Step 2: Dry run**

Run: `npm run migrate -- --dry-run`
Expected: een regel `+ projecten/<slug>` per DatoCMS-project en `+ blog/<slug>` per artikel, afgesloten met `Dry run: N projecten en M posts gelezen, niets aangemaakt.` Geen tokens in de uitvoer.

Krijg je een GraphQL-fout over een onbekend veld (bijv. `paragraaf` of `urlDesign`), open dan het DatoCMS-model en pas de query én het bijbehorende type in `transform.ts` aan naar de echte veldnaam. Draai daarna Task 9 Step 4 opnieuw.

- [ ] **Step 3 (met akkoord van Stefan): Echt draaien**

Vraag Stefan eerst om akkoord, want dit schrijft naar Centaur.

Run: `npm run migrate`
Expected: `Klaar: N aangemaakt, 0 overgeslagen. Alles staat als concept in Centaur.`

Draai daarna nog een keer `npm run migrate -- --dry-run`. Expected: alleen `=`-regels, wat bewijst dat het script idempotent is.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-datocms.ts
git commit -m "feat: add one-off DatoCMS to Centaur migration script"
```

- [ ] **Step 5 (Stefan): Content in Centaur**
  - De migratie-concepten reviewen en publiceren wat blijft.
  - Voor WaldJS, Centaur CMS en Steva's Kookboek een NL-entry aanmaken met `featured: true`, `order` 1/2/3, `type` en een samenvatting.
  - Daarna de schrijf-sleutel intrekken en `CENTAUR_WRITE_KEY` uit `.env` halen.

---

### Task 11: Fonts, tokens en basis-CSS

**Files:**
- Create: `scripts/fetch-fonts.mjs`, `public/fonts/fraunces-latin.woff2`, `public/fonts/jetbrains-mono-latin.woff2`, `src/styles/fonts.css`, `src/styles/tokens.css`, `src/styles/base.css`

- [ ] **Step 1: Font-script schrijven**

`scripts/fetch-fonts.mjs`:

```js
// Downloadt de Latijnse subsets van Fraunces (variabel: opsz, wght, SOFT) en JetBrains Mono
// (variabel: wght) van Google Fonts naar public/fonts/. Eenmalig draaien; beide fonts zijn OFL.
import { mkdirSync, writeFileSync } from 'node:fs'

// Google Fonts geeft alleen woff2 aan een moderne browser-UA.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
const FONTS = [
  ['fraunces-latin.woff2', 'Fraunces:opsz,wght,SOFT@9..144,300..800,0..100'],
  ['jetbrains-mono-latin.woff2', 'JetBrains+Mono:wght@400..700']
]

mkdirSync('public/fonts', { recursive: true })
for (const [file, family] of FONTS) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}&display=swap`, { headers: { 'User-Agent': UA } })).text()
  const url = css.split('/* latin */')[1]?.match(/url\((https:[^)]+\.woff2)\)/)?.[1]
  if (!url) throw new Error(`Geen latin-woff2 gevonden voor ${family}`)
  writeFileSync(`public/fonts/${file}`, Buffer.from(await (await fetch(url)).arrayBuffer()))
  console.log(`✓ public/fonts/${file}`)
}
```

- [ ] **Step 2: Fonts downloaden**

Run: `npm run fonts && ls -la public/fonts`
Expected: `✓ public/fonts/fraunces-latin.woff2` en `✓ public/fonts/jetbrains-mono-latin.woff2`, beide groter dan 20 KB.

- [ ] **Step 3: CSS schrijven**

`src/styles/fonts.css`:

```css
/* Zelf gehost (public/fonts, OFL). Alleen het Latijnse subset: genoeg voor NL en EN. */
@font-face {
  font-family: 'Fraunces';
  font-style: normal;
  font-weight: 300 800;
  font-display: swap;
  src: url(/fonts/fraunces-latin.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url(/fonts/jetbrains-mono-latin.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

`src/styles/tokens.css`:

```css
/* Design tokens (spec: "Visueel systeem"). Donker thema; er is bewust geen light mode. */
:root {
  color-scheme: dark;

  --bg: #0b0d12;
  --surface: rgb(21 25 36 / 0.72);
  --border: #2a3245;
  --text: #e8eaf0;
  --text-muted: #9aa1b2;
  --accent: #4d7cff;
  --accent-2: #9b6bff;
  --brand: #0f40ec;

  --font-serif: 'Fraunces', Georgia, serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --text-sm: clamp(0.875rem, 0.85rem + 0.1vw, 0.9375rem);
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-lg: clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem);
  --text-xl: clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem);
  --text-2xl: clamp(2.5rem, 1.8rem + 3.2vw, 4.5rem);

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;

  --radius-sm: 8px;
  --radius-lg: 12px;
  --page-width: 75rem;
  --page-gutter: clamp(1rem, 4vw, 3rem);
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}
```

`src/styles/base.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }

html { -webkit-text-size-adjust: 100%; }

body {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-serif);
  font-size: var(--text-base);
  line-height: 1.6;
  isolation: isolate;
}

main { flex: 1; }

h1, h2, h3 {
  line-height: 1.05;
  letter-spacing: -0.025em;
  font-variation-settings: 'opsz' 144;
  text-wrap: balance;
}

img { max-width: 100%; display: block; }

a { color: var(--accent); text-underline-offset: 0.2em; }
a:hover { color: var(--text); }

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 2px;
}

::selection { background: var(--brand); color: #fff; }

/* Toegankelijk verborgen, wel voorgelezen. */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.skip-link {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  z-index: 10;
  padding: var(--space-2) var(--space-4);
  background: var(--brand);
  color: #fff;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  transform: translateY(-200%);
}
.skip-link:focus { transform: none; }

/* Stenen achtergrond: donker gemaakt, als textuur achter alle content (spec: "Stenen achtergrond").
   Iets hoger dan het scherm, zodat de parallax uit plan 3 ruimte heeft. */
.stone {
  position: fixed;
  inset: -10vh 0 auto;
  z-index: -1;
  width: 100%;
  height: 120vh;
  object-fit: cover;
  filter: grayscale(1) brightness(0.55) contrast(1.4);
  mix-blend-mode: luminosity;
  opacity: 0.35;
  pointer-events: none;
}

/* Inhoudsbreedte met vaste marges. */
.container {
  width: 100%;
  max-width: calc(var(--page-width) + 2 * var(--page-gutter));
  margin-inline: auto;
  padding-inline: var(--page-gutter);
}
```

- [ ] **Step 4: Commit**

```bash
git add scripts/fetch-fonts.mjs public/fonts src/styles
git commit -m "feat: add self-hosted fonts, design tokens and base styles"
```

---

### Task 12: Layout, Nav en Footer

**Files:**
- Create: `src/layouts/Layout.wald`, `src/components/Nav.wald`, `src/components/Footer.wald`

- [ ] **Step 1: `src/components/Nav.wald` schrijven**

```wald
---
import { langSwitchHref, localePath, otherLocale, t, type Locale, type MessageKey } from '../lib/i18n'
type NavRoute = 'work' | 'blog' | 'about' | 'contact'
type Props = {
  locale: Locale
  /** Dezelfde pagina in andere talen; de taalwissel linkt daarheen. */
  alternates: Partial<Record<Locale, string>>
  current?: NavRoute
}
const { locale, alternates, current } = $$props
const routes: Array<[NavRoute, MessageKey]> = [['work', 'nav.work'], ['blog', 'nav.blog'], ['about', 'nav.about'], ['contact', 'nav.contact']]
const items = routes.map(([route, label]) => {
  const ariaCurrent = new SafeHtml(route === current ? ' aria-current="page"' : '')
  return renderTemplate`<li><a class="nav__link" href="${localePath(route, locale)}"${ariaCurrent}>${t(label, locale)}</a></li>`
}).join('')
const other = otherLocale(locale)
const langSwitch = renderTemplate`<a class="nav__lang" href="${langSwitchHref(alternates, locale)}" hreflang="${other}" lang="${other}">${t('lang.switch', locale)}</a>`
---
<header class="nav container">
  <a class="nav__home" href={localePath('home', locale)}>~/steefan</a>
  <nav aria-label={t('nav.label', locale)}>
    <ul class="nav__list" role="list">{new SafeHtml(items)}</ul>
  </nav>
  {new SafeHtml(langSwitch)}
</header>

<style>
/* Links en taalwissel worden in de frontmatter gebouwd: genest onder .nav gestyled. */
.nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-8);
  padding-block: var(--space-6);
  font-family: var(--font-mono);
  font-size: var(--text-sm);

  & .nav__home {
    margin-right: auto;
    color: var(--text);
    text-decoration: none;
    font-weight: 700;
  }
  & .nav__list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-6);
    padding: 0;
    list-style: none;
  }
  & .nav__link,
  & .nav__lang {
    color: var(--text-muted);
    text-decoration: none;
  }
  & .nav__link:hover,
  & .nav__lang:hover,
  & .nav__link[aria-current='page'] {
    color: var(--text);
  }
  & .nav__link[aria-current='page'] {
    text-decoration: underline;
    text-decoration-color: var(--accent);
  }
  & .nav__lang {
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--border);
    border-radius: 999px;
  }
}
</style>
```

- [ ] **Step 2: `src/components/Footer.wald` schrijven**

```wald
---
import { t, type Locale } from '../lib/i18n'
type Props = { locale: Locale }
const { locale } = $$props
const year = new Date().getFullYear()
---
<footer class="footer container">
  <p>{t('footer.text', locale)}</p>
  <p>© {year} Stefan</p>
</footer>

<style>
.footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-2) var(--space-8);
  margin-top: var(--space-24);
  padding-block: var(--space-8);
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}
</style>
```

- [ ] **Step 3: `src/layouts/Layout.wald` schrijven**

```wald
---
import Nav from '../components/Nav.wald'
import Footer from '../components/Footer.wald'
import { readFileSync } from 'node:fs'
import { getSiteSettings } from '../lib/cms'
import { t, type Locale } from '../lib/i18n'
import { absoluteUrl } from '../lib/site'
type Props = {
  title: string
  /** true: titel zoals hij is, zonder " — Steefan" (de home). */
  fullTitle?: boolean
  description?: string
  /** Pad van deze pagina, bv. "/werk": voor canonical en og:url. */
  path: string
  locale: Locale
  /** Deze pagina in elke taal waarin hij bestaat: voor hreflang en de taalwissel. */
  alternates?: Partial<Record<Locale, string>>
  current?: 'work' | 'blog' | 'about' | 'contact'
  noindex?: boolean
  pond?: unknown
}
const { title, fullTitle = false, description = '', path, locale, alternates = {}, current, noindex = false, pond } = $$props
const site = await getSiteSettings()
const siteName = site?.siteName || 'Steefan'
const documentTitle = fullTitle ? title : `${title} — ${siteName}`
const canonical = absoluteUrl(path)

const hreflang = Object.entries(alternates).map(([lang, href]) =>
  renderTemplate`<link rel="alternate" hreflang="${lang}" href="${absoluteUrl(String(href))}">`)
if (alternates.nl) hreflang.push(renderTemplate`<link rel="alternate" hreflang="x-default" href="${absoluteUrl(alternates.nl)}">`)

const headTags = [
  description ? renderTemplate`<meta name="description" content="${description}">` : '',
  noindex ? '<meta name="robots" content="noindex, follow">' : '',
  renderTemplate`<link rel="canonical" href="${canonical}">`,
  renderTemplate`<meta property="og:title" content="${documentTitle}">`,
  description ? renderTemplate`<meta property="og:description" content="${description}">` : '',
  renderTemplate`<meta property="og:url" content="${canonical}">`,
  renderTemplate`<meta property="og:locale" content="${locale === 'nl' ? 'nl_NL' : 'en_GB'}">`,
  ...hreflang
].filter(Boolean).join('\n    ')

// Fonts, tokens en basis-CSS zijn klein: inline in <head> in plaats van een blokkerende stylesheet.
// "</" escapen zodat CSS de <style> nooit kan sluiten.
const inlineCss = `<style data-wald-no-hoist>${['src/styles/fonts.css', 'src/styles/tokens.css', 'src/styles/base.css']
  .map(file => readFileSync(file, 'utf8')).join('\n').replace(/<\//g, '<\\/')}</style>`

const nav = await Nav.render({ locale, alternates, current })
const footer = await Footer.render({ locale })
---
<!DOCTYPE html>
<html lang={locale}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>{documentTitle}</title>
    {new SafeHtml(headTags)}
    <link rel="icon" href="/favicon.png" type="image/png" />
    <link rel="preload" href="/fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin />
    {new SafeHtml(inlineCss)}
  </head>
  <body>
    <a class="skip-link" href="#main">{t('skip', locale)}</a>
    <img
      class="stone"
      src="/images/stone/stone-1400.webp"
      srcset="/images/stone/stone-489.webp 489w, /images/stone/stone-857.webp 857w, /images/stone/stone-1400.webp 1400w"
      sizes="100vw"
      alt=""
      decoding="async"
      data-motion="parallax"
    />
    {new SafeHtml(nav)}
    {pond}
    {new SafeHtml(footer)}
  </body>
</html>
```

- [ ] **Step 4: Type-check**

Run: `npm run check`
Expected: geen fouten. Klaagt `wald check` over `renderTemplate`/`SafeHtml`-types bij `.join('')`, kijk dan hoe `src/pages/index.wald` van Steva's Kookboek hetzelfde patroon gebruikt en volg dat precies.

- [ ] **Step 5: Commit**

```bash
git add src/layouts src/components/Nav.wald src/components/Footer.wald
git commit -m "feat: add layout with stone background, navigation and footer"
```

---

### Task 13: Home (NL + EN) en 404, end-to-end

Vereist een gevulde `.env` (Task 8). Zonder gepubliceerde projecten toont de home de lege staat, en dat is ook goed.

**Files:**
- Create: `src/components/pages/HomePage.wald`, `src/pages/en/index.wald`, `src/pages/404.wald`
- Modify: `src/pages/index.wald` (tijdelijke pagina vervangen)

- [ ] **Step 1: `src/components/pages/HomePage.wald` schrijven**

Eerste versie: hero en een lijst met uitgelichte projecten. De bento, rail en overige secties komen in plan 2. De projectlinks geven een 404 tot plan 2 de case-study-route toevoegt.

```wald
---
import Layout from '../../layouts/Layout.wald'
import { getFeaturedProjects } from '../../lib/content'
import { localePath, t, type Locale } from '../../lib/i18n'
type Props = { locale: Locale }
const { locale } = $$props
const projects = await getFeaturedProjects(locale)
const cards = projects.map(project => renderTemplate`
  <li class="home__project">
    <a class="home__project-link" href="${localePath('project', locale, project.slug)}">
      <h3 class="home__project-title">${project.title}</h3>
      <p class="home__project-summary">${project.summary}</p>
    </a>
  </li>`).join('')
const list = projects.length
  ? `<ul class="home__projects" role="list">${cards}</ul>`
  : renderTemplate`<p class="home__empty">${t('home.empty', locale)}</p>`
const alternates = { nl: localePath('home', 'nl'), en: localePath('home', 'en') }
---
<Layout title={t('home.title', locale)} fullTitle={true} description={t('home.description', locale)} path={localePath('home', locale)} locale={locale} alternates={alternates}>
  <main id="main" class="home container">
    <h1 class="home__title">{t('home.heading', locale)}</h1>
    <p class="home__lead">{t('home.lead', locale)}</p>
    <h2 class="home__subtitle">{t('home.featured', locale)}</h2>
    {new SafeHtml(list)}
  </main>
</Layout>

<style>
.home {
  padding-top: var(--space-16);

  & .home__title {
    max-width: 16ch;
    font-size: var(--text-2xl);
    font-weight: 700;
  }
  & .home__lead {
    margin-top: var(--space-4);
    color: var(--text-muted);
    font-size: var(--text-lg);
  }
  & .home__subtitle {
    margin-top: var(--space-16);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 400;
    letter-spacing: 0;
    color: var(--text-muted);
    text-transform: uppercase;
  }
  & .home__projects {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
    gap: var(--space-4);
    margin-top: var(--space-6);
    padding: 0;
    list-style: none;
  }
  & .home__project-link {
    display: block;
    height: 100%;
    padding: var(--space-6);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    backdrop-filter: blur(6px);
    color: var(--text);
    text-decoration: none;
  }
  & .home__project-link:hover {
    border-color: var(--accent);
  }
  & .home__project-title {
    font-size: var(--text-lg);
  }
  & .home__project-summary {
    margin-top: var(--space-2);
    color: var(--text-muted);
  }
  & .home__empty {
    margin-top: var(--space-6);
    color: var(--text-muted);
  }
}
</style>
```

- [ ] **Step 2: Routes schrijven**

`src/pages/index.wald` (overschrijven):

```wald
---
import HomePage from '../components/pages/HomePage.wald'
---
<HomePage locale="nl" />
```

`src/pages/en/index.wald`:

```wald
---
import HomePage from '../../components/pages/HomePage.wald'
---
<HomePage locale="en" />
```

`src/pages/404.wald`:

```wald
---
import Layout from '../layouts/Layout.wald'
import { localePath, t } from '../lib/i18n'
---
<Layout title={t('notFound.title', 'nl')} path="/404" locale="nl" noindex={true}>
  <main id="main" class="not-found container">
    <h1 class="not-found__title">404</h1>
    <p>{t('notFound.body', 'nl')} <a href={localePath('home', 'nl')}>{t('notFound.back', 'nl')}</a></p>
    <p lang="en">{t('notFound.body', 'en')} <a href={localePath('home', 'en')}>{t('notFound.back', 'en')}</a></p>
  </main>
</Layout>

<style>
.not-found {
  padding-top: var(--space-24);
  display: grid;
  gap: var(--space-4);
}
.not-found__title {
  font-size: var(--text-2xl);
}
</style>
```

- [ ] **Step 3: Alles controleren**

```bash
npm test
npm run check
```

Expected: alle tests slagen (`cms`, `i18n`, `content`, `content-loaders`, `github`, `site`, `transform`), en `wald check` geeft geen fouten.

```bash
npm run dev &
sleep 5
curl -s http://localhost:7233/ | grep -oE '<html lang="nl"|Ik bouw mijn eigen tools\.|hreflang="en"|class="stone"'
curl -s http://localhost:7233/en | grep -oE '<html lang="en"|I build my own tools\.|hreflang="nl"'
curl -s http://localhost:7233/404 | grep -o 'noindex'
kill %1
```

Expected: alle gegrepte strings komen terug. Open daarna http://localhost:7233 in de browser en controleer visueel:
- donkere achtergrond met de grijze steentextuur
- Fraunces in de kop, JetBrains Mono in de nav
- de taalwissel linkt van `/` naar `/en` en terug
- de skip-link verschijnt bij de eerste Tab
- de focus-ring is blauw

```bash
npm run build
ls .vercel/output/static
```

Expected: de build slaagt. `static/` bevat `index.html`, `en/` en `404/`.

- [ ] **Step 4: Commit**

```bash
git add src/components/pages src/pages
git commit -m "feat: add bilingual home and 404 pages"
```

---

## Na dit plan

- Laat Stefan de home lokaal bekijken (`npm run dev`).
- Schrijf daarna **Plan 2: Pagina's** op basis van de spec-secties "Sitemap" en "Toegankelijkheid". Daarin zitten bento, rail-markup, werk-overzicht met filter, case study, blog, over (tijdlijn, skills, GitHub), contact met Centaur Forms, de `home`/`over`/`contact`-pagina's in Centaur en de EN-routes.
