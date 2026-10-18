# Portfolio redesign — Plan 2: Pagina's

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alle pagina's van het portfolio bouwen met data uit Centaur, in NL en EN: home (volledig), werk-overzicht met filter, case study, blog-overzicht en -post, over en contact. De nieuwe kleuren (saffraan) en de vooraf gebakken stenen achtergrond worden eerst doorgevoerd.

**Architecture:** Pure data-logica in `src/lib/` (Vitest, TDD). Herbruikbare componenten in `src/components/`; pagina-componenten in `src/components/pages/` krijgen een `locale`-prop en worden door dunne wrappers in `src/pages/` en `src/pages/en/` gerenderd. Alles is statisch en werkt zonder JavaScript; elementen die in plan 3 bewegen krijgen alvast een `data-motion`-attribuut. De horizontale stroken en de tijdlijn zijn zonder JavaScript een swipe-lijst respectievelijk een verticale tijdlijn.

**Tech Stack:** WaldJS (`@waldjs/cli` 0.12), TypeScript, Vitest, sharp (stenen achtergrond bakken), Centaur CMS REST + Forms API.

**Spec:** [2026-10-12-portfolio-redesign-design.md](../specs/2026-10-12-portfolio-redesign-design.md) (herzien 2026-10-18)

**Vorig plan:** [2026-10-12-portfolio-fundament.md](2026-10-12-portfolio-fundament.md) — afgerond.

---

## Voordat je begint

- Branch `redesign`, repo `/Users/stefan/Desktop/hva-FDND/portfolio`. Node ≥ 22.
- `.env` bevat werkende `CENTAUR_API_BASE`, `CENTAUR_API_KEY`, `CENTAUR_TENANT_SLUG`. **Nooit** waarden uit `.env` tonen of committen.
- Centaur heeft de collecties `projecten`, `blog`, `ervaring`, `skills`, `status`, `klanten` (veldslugs: `docs/centaur-collecties.md`). Er staan 12 projecten als concept; de publieke API (`/content/<slug>`) levert alleen **gepubliceerde** items. Lege collecties zijn geen fout: elke pagina heeft een lege staat.
- **Poort 7233 is bezet** door de dev-server van een ander project (Steva's Kookboek), en `wald grow` heeft een vaste poort. Controleer daarom tegen de productiebuild: `npm run build`, dan `python3 -I -m http.server 4322 --bind 127.0.0.1 -d .vercel/output/static` op de achtergrond, curl/screenshots, en die server daarna stoppen. Stop nooit processen op 7233 of 4321.
- Screenshots: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1280,900 --virtual-time-budget=3000 --screenshot=<pad>.png <url>`. Headless Chrome dwingt een minimale vensterbreedte af: test mobiel (390px) via een wrapper-pagina met `<iframe src="…" width="390" height="844">`.
- **WaldJS-primer** (zie ook plan 1): frontmatter tussen `---`; props via `$$props` en `type Props`; geen loops/if in templates — lijsten bouw je in de frontmatter met `renderTemplate` (escapet) en voeg je in met `{new SafeHtml(html)}`; componenten renderen met `await X.render(props)`; layout-inhoud via `{pond}`; `<style>` is scoped en HTML die als string is gebouwd krijgt geen scope-attribuut, dus style die **genest** onder de buitenste (gescopete) selector (`.x { & .y {…} }`); `wald check` ziet type-aliassen buiten `Props` niet, schrijf union-types in `Props` uit. Referentieproject: `/Users/stefan/Desktop/semantique-agency/repositories/Steva-s-Kookboek`.
- Richtext-velden uit Centaur zijn vertrouwde HTML van de eigenaar en worden met `SafeHtml` gerenderd. Alle andere CMS-tekst gaat via `renderTemplate` of attribuut-interpolatie (escapet).
- Commit-messages eindigen met je standaard Co-Authored-By-regel.

## File map

| Bestand | Verantwoordelijkheid |
|---|---|
| `scripts/bake-stone.mjs`, `assets-src/stone-1400.webp`, `public/images/stone/stone-dark-*.webp` | Stenen achtergrond vooraf donker bakken |
| `src/styles/tokens.css`, `base.css` | Saffraan-tokens, selectie, steen zonder filter |
| `src/lib/content.ts` (+ tests) | Metrics, status, klanten, dubbele slugs, overige projecten |
| `src/lib/i18n.ts` (+ tests) | UI-teksten voor alle pagina's, `formatDate`, `formatMonth` |
| `src/lib/site.ts` | `CONTACT_EMAIL`, `GITHUB_URL` |
| `src/components/ProjectCard.wald`, `PostCard.wald`, `HScroll.wald` | Kaarten en de horizontale strook |
| `src/components/Bento.wald`, `Marquee.wald`, `ClientRow.wald`, `Availability.wald` | Home-onderdelen |
| `src/components/Metrics.wald`, `Timeline.wald` | Case-study-onderdelen |
| `src/components/ContactForm.wald`, `public/contact.js` | Contactformulier → Centaur Forms |
| `public/filter.js` | Typefilter op het werk-overzicht |
| `src/components/pages/{Home,Work,Project,BlogIndex,BlogPost,About,Contact}Page.wald` | Pagina-componenten (locale-prop) |
| `src/pages/…`, `src/pages/en/…` | Dunne route-wrappers |

---

### Task 1: Saffraan en gebakken steen

**Files:**
- Create: `scripts/bake-stone.mjs`, `public/images/stone/stone-dark-489.webp`, `stone-dark-857.webp`, `stone-dark-1400.webp`
- Move: `public/images/stone/stone-1400.webp` → `assets-src/stone-1400.webp`; delete `public/images/stone/stone-489.webp`, `stone-857.webp`
- Modify: `package.json`, `src/styles/tokens.css`, `src/styles/base.css`, `src/layouts/Layout.wald`

- [ ] **Step 1: Bron verplaatsen en sharp toevoegen**

```bash
mkdir -p assets-src
git mv public/images/stone/stone-1400.webp assets-src/stone-1400.webp
git rm -q public/images/stone/stone-489.webp public/images/stone/stone-857.webp
npm install -D sharp@^0.33.5
```

- [ ] **Step 2: `scripts/bake-stone.mjs` schrijven**

```js
// Bakt de CSS-filters van de stenen achtergrond in de afbeelding zelf (spec: "Stenen achtergrond"):
// grayscale, brightness .55, contrast 1.4 en 35% dekking over #0b0d12. De browser hoeft dan niets
// meer te filteren. Gebruik: npm run stone
import sharp from 'sharp'

const [src = 'assets-src/stone-1400.webp', outDir = 'public/images/stone'] = process.argv.slice(2)
const BG = [11, 13, 18]
const OPACITY = 0.35

for (const width of [489, 857, 1400]) {
  // brightness(.55) + contrast(1.4): y = (x * .55 - 127.5) * 1.4 + 127.5 = .77x - 51 (sharp clipt op 0..255)
  const { data, info } = await sharp(src).resize({ width }).grayscale().linear(0.77, -51)
    .toColourspace('srgb').raw().toBuffer({ resolveWithObject: true })
  const out = Buffer.alloc(info.width * info.height * 3)
  for (let i = 0, p = 0; i < data.length; i += info.channels) {
    for (let c = 0; c < 3; c++) {
      const value = data[i + (info.channels === 1 ? 0 : c)]
      out[p++] = Math.round(OPACITY * value + (1 - OPACITY) * BG[c])
    }
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } })
    .webp({ quality: 72 }).toFile(`${outDir}/stone-dark-${width}.webp`)
  console.log(`✓ ${outDir}/stone-dark-${width}.webp`)
}
```

Voeg in `package.json` bij `scripts` toe: `"stone": "node scripts/bake-stone.mjs"`.

- [ ] **Step 3: Bakken**

Run: `npm run stone && ls -la public/images/stone`
Expected: drie `✓`-regels; `stone-dark-1400.webp` ongeveer 50 KB.

- [ ] **Step 4: Tokens**

In `src/styles/tokens.css`, vervang de regels van `--surface`, `--accent`, `--accent-2` en `--brand` door:

```css
  --surface: rgb(21 25 36 / 0.9);
  --border: #2a3245;
  --text: #e8eaf0;
  --text-muted: #9aa1b2;
  --accent: #ffb000;
  --accent-2: #f28c18;
  --brand: #161208;
  --selection-bg: #3a2a0a;
  --selection-text: #ffd27a;
```

(`--border`, `--text` en `--text-muted` staan er al; zorg dat ze precies één keer voorkomen.)

- [ ] **Step 5: Basis-CSS**

In `src/styles/base.css`:

1. Vervang `::selection { background: var(--brand); color: #fff; }` door:
```css
::selection { background: var(--selection-bg); color: var(--selection-text); }
```
2. In `.skip-link`: vervang `background: var(--brand);` en `color: #fff;` door `background: var(--accent);` en `color: var(--bg);`.
3. Vervang het hele `.stone {…}`-blok (inclusief het commentaar erboven) door:
```css
/* Stenen achtergrond: vooraf donker gebakken (scripts/bake-stone.mjs), dus zonder CSS-filter.
   Iets hoger dan het scherm, zodat de parallax uit plan 3 ruimte heeft. */
.stone {
  position: fixed;
  inset: -10vh 0 auto;
  z-index: -1;
  width: 100%;
  height: 120vh;
  object-fit: cover;
  pointer-events: none;
  will-change: transform;
}
```

- [ ] **Step 6: Layout**

In `src/layouts/Layout.wald`, vervang de `<img class="stone" … />` door:

```wald
    <img
      class="stone"
      src="/images/stone/stone-dark-1400.webp"
      srcset="/images/stone/stone-dark-489.webp 489w, /images/stone/stone-dark-857.webp 857w, /images/stone/stone-dark-1400.webp 1400w"
      sizes="100vw"
      alt=""
      decoding="async"
      data-motion="parallax"
    />
```

- [ ] **Step 7: Controleren**

```bash
npm run check && npm run build
grep -c "stone-dark-1400" .vercel/output/static/index.html
grep -c "ffb000" .vercel/output/static/index.html
```

Expected: check zonder fouten, build slaagt, beide greps ≥ 1. Maak een screenshot van `/` (zie "Voordat je begint"): donkere steen zichtbaar, logo en "Uitgelicht werk" in saffraan.

- [ ] **Step 8: Commit**

```bash
git add -A assets-src public/images/stone scripts/bake-stone.mjs package.json package-lock.json src/styles src/layouts/Layout.wald
git commit -m "feat: saffron accent and pre-baked dark stone background"
```

---

### Task 2: Content-uitbreidingen (TDD)

**Files:**
- Modify: `src/lib/content.ts`, `src/lib/content.test.ts`
- Test: `src/lib/content-extra.test.ts`

- [ ] **Step 1: Bestaande toProject-verwachting bijwerken**

In `src/lib/content.test.ts`, in de test `'mapt alle velden naar camelCase'`: voeg in het verwachte object na `npmPackage: '@waldjs/cli'` een regel `metrics: []` toe (komma op de regel ervoor).

- [ ] **Step 2: Failing tests schrijven**

`src/lib/content-extra.test.ts`:

```ts
import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('./cms', () => ({ getCollection: vi.fn() }))

import { getCollection, type CentaurEntry } from './cms'
import {
  clearContentCache,
  getClients,
  getOtherProjects,
  getProjects,
  getStatus,
  parseMetrics,
  toClient,
  toProject,
  toStatus
} from './content'

const entry = (id: string, data: Record<string, unknown>): CentaurEntry => ({
  id, data, status: 'published', publishedAt: null, createdAt: '', updatedAt: ''
})

describe('parseMetrics', () => {
  test('één cijfer per regel, "Label: waarde"', () => {
    expect(parseMetrics('Lighthouse: 100\nLaadtijd: 0,4 s\n\nkapot\n: leeg')).toEqual([
      { label: 'Lighthouse', value: '100' },
      { label: 'Laadtijd', value: '0,4 s' }
    ])
    expect(parseMetrics(undefined)).toEqual([])
  })

  test('toProject leest metrics', () => {
    const project = toProject(entry('p', { locale: 'nl', translation_key: 'w', slug: 'w', title: 'W', metrics: 'JS: 0 KB' }))
    expect(project?.metrics).toEqual([{ label: 'JS', value: '0 KB' }])
  })
})

describe('toStatus en toClient', () => {
  test('status', () => {
    expect(toStatus(entry('s', { locale: 'nl', translation_key: 'status', available: true, text: 'Beschikbaar vanaf januari' }))).toEqual({
      id: 's', locale: 'nl', translationKey: 'status', slug: '', available: true, text: 'Beschikbaar vanaf januari'
    })
    expect(toStatus(entry('s', { locale: 'nl', translation_key: 'status', text: '' }))).toBeNull()
  })

  test('klant', () => {
    expect(toClient(entry('k', { locale: 'en', translation_key: 'fdnd', name: 'FDND', logo: 'https://cdn/x.svg', url: 'https://fdnd.nl', quote: 'Goed', quote_author: 'Koop', order: 2 }))).toEqual({
      id: 'k', locale: 'en', translationKey: 'fdnd', slug: '', name: 'FDND', logo: 'https://cdn/x.svg', url: 'https://fdnd.nl', quote: 'Goed', quoteAuthor: 'Koop', order: 2
    })
    expect(toClient(entry('k', { locale: 'en', translation_key: 'x', name: '' }))).toBeNull()
  })
})

describe('loaders', () => {
  const collections: Record<string, CentaurEntry[]> = {
    projecten: [
      entry('a', { locale: 'nl', translation_key: 'a', slug: 'dubbel', title: 'Eerste', featured: true, order: 1 }),
      entry('b', { locale: 'nl', translation_key: 'b', slug: 'dubbel', title: 'Tweede' }),
      entry('c', { locale: 'nl', translation_key: 'c', slug: 'oud', title: 'Oud', year: 2023 })
    ],
    status: [
      entry('s1', { locale: 'nl', translation_key: 'status', available: true, text: 'Beschikbaar' }),
      entry('s2', { locale: 'en', translation_key: 'status', available: false, text: 'Fully booked' })
    ],
    klanten: [
      entry('k1', { locale: 'nl', translation_key: 'z', name: 'Zeta', order: 2 }),
      entry('k2', { locale: 'nl', translation_key: 'a', name: 'Alfa', order: 1 }),
      entry('k3', { locale: 'nl', translation_key: 'm', name: 'Mid' })
    ]
  }

  beforeEach(() => {
    clearContentCache()
    vi.mocked(getCollection).mockClear()
    vi.mocked(getCollection).mockImplementation(async slug => collections[slug] ?? [])
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  test('dubbele slug per taal: alleen de eerste blijft, met een waarschuwing', async () => {
    expect((await getProjects('nl')).map(p => p.id)).toEqual(['a', 'c'])
    expect(console.warn).toHaveBeenCalledWith('⚠ projecten: slug "dubbel" (nl) komt meerdere keren voor; entry b wordt overgeslagen')
  })

  test('getOtherProjects: alles behalve uitgelicht', async () => {
    expect((await getOtherProjects('nl')).map(p => p.id)).toEqual(['c'])
  })

  test('getStatus per taal, of null', async () => {
    expect((await getStatus('en'))?.text).toBe('Fully booked')
    collections.status = []
    clearContentCache()
    expect(await getStatus('nl')).toBeNull()
  })

  test('getClients: op volgorde, zonder volgorde achteraan', async () => {
    expect((await getClients('nl')).map(c => c.name)).toEqual(['Alfa', 'Zeta', 'Mid'])
  })
})
```

- [ ] **Step 3: Tests draaien en zien falen**

Run: `npx vitest run src/lib/content-extra.test.ts src/lib/content.test.ts`
Expected: FAIL (`parseMetrics is not a function` e.d., en de toProject-verwachting mist `metrics`).

- [ ] **Step 4: Implementatie**

In `src/lib/content.ts`:

1. Voeg onder de `rows`-helper toe:

```ts
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
```

2. Voeg aan `interface Project` na `npmPackage: string` toe: `metrics: Metric[]`, en in `toProject` na `npmPackage: text(data.npm_package)` (komma erachter): `metrics: parseMetrics(data.metrics)`.

3. Voeg na het blok `toSkill` toe:

```ts
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
  return { ...base, name, logo: text(data.logo), url: text(data.url), quote: text(data.quote), quoteAuthor: text(data.quote_author), order: num(data.order) }
}
```

4. In `load()`: vervang de regel `if (item) items.push(item)` en de `else`-regel door:

```ts
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
```

en voeg direct onder `const items: T[] = []` toe: `const slugs = new Set<string>()`.

5. Vervang `getExperience` en `getSkills` en voeg de nieuwe loaders toe (onderaan het bestand):

```ts
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
```

(Verwijder de oude `getExperience`/`getSkills`, zodat ze maar één keer bestaan.)

- [ ] **Step 5: Tests draaien en zien slagen**

Run: `npx vitest run`
Expected: alle testbestanden slagen (de bestaande 52 + de nieuwe).

- [ ] **Step 6: Commit**

```bash
git add src/lib/content.ts src/lib/content.test.ts src/lib/content-extra.test.ts
git commit -m "feat: metrics, status, clients and duplicate-slug guard in content lib"
```

---

### Task 3: i18n voor alle pagina's (TDD)

**Files:**
- Modify: `src/lib/i18n.ts`, `src/lib/i18n.test.ts`, `src/lib/site.ts`

- [ ] **Step 1: Failing tests toevoegen**

Voeg onderaan de `describe('i18n', …)` in `src/lib/i18n.test.ts` toe (en importeer `formatDate, formatMonth`):

```ts
  test('formatDate en formatMonth per taal', () => {
    expect(formatDate('2024-05-01', 'nl')).toBe('1 mei 2024')
    expect(formatDate('2024-05-01', 'en')).toBe('1 May 2024')
    expect(formatMonth('2023-09-01', 'nl')).toBe('sep 2023')
    expect(formatMonth('2023-09-01', 'en')).toBe('Sept 2023')
    expect(formatDate('', 'nl')).toBe('')
    expect(formatDate('geen datum', 'nl')).toBe('')
  })

  test('nieuwe teksten bestaan in beide talen', () => {
    expect(t('work.heading', 'nl')).toBe('Werk')
    expect(t('work.heading', 'en')).toBe('Work')
    expect(t('type.framework', 'en')).toBe('Framework')
  })
```

Let op: de exacte maand-afkortingen hangen af van de ICU-data van Node. Faalt alleen `formatMonth` op de afkorting (bv. `Sep` i.p.v. `Sept`), pas dan de verwachting aan naar wat `new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date('2023-09-01'))` in deze Node-versie geeft.

- [ ] **Step 2: Tests draaien en zien falen**

Run: `npx vitest run src/lib/i18n.test.ts`
Expected: FAIL (`formatDate` bestaat niet).

- [ ] **Step 3: Teksten en helpers**

Vervang in `src/lib/i18n.ts` het complete `nl`-object en het complete `en`-object door:

```ts
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
  'home.clients': 'Gewerkt met',
  'home.other': 'Ander werk',
  'home.about': 'Over mij',
  'home.aboutText': 'Ik ben Stefan, frontend developer en designer. Ik bouw snelle, toegankelijke websites en de tools waarmee ik ze maak: een eigen framework en een eigen CMS.',
  'home.aboutLink': 'Meer over mij',
  'home.blog': 'Uit de blog',
  'home.cta': 'Zullen we praten?',
  'type.framework': 'Framework',
  'type.product': 'Product',
  'type.website': 'Website',
  'type.school': 'Schoolproject',
  'work.title': 'Werk',
  'work.description': 'Alle projecten van Stefan: frameworks, producten, websites en schoolprojecten.',
  'work.heading': 'Werk',
  'work.lead': 'Van eigen frameworks tot websites voor klanten.',
  'work.filterLabel': 'Filter op type',
  'work.filterAll': 'Alles',
  'work.count': '{n} projecten',
  'project.process': 'Van probleem naar resultaat',
  'project.problem': 'Probleem',
  'project.approach': 'Aanpak',
  'project.result': 'Resultaat',
  'project.metrics': 'In cijfers',
  'project.details': 'Stack en links',
  'project.stack': 'Stack',
  'project.live': 'Bekijk live',
  'project.repo': 'Broncode',
  'project.design': 'Ontwerp',
  'project.npm': 'npm-pakket',
  'project.gallery': 'Beelden',
  'project.client': 'Klant',
  'blog.title': 'Blog',
  'blog.description': 'Artikelen van Stefan over webdevelopment, design en het bouwen van eigen tools.',
  'blog.heading': 'Blog',
  'blog.empty': 'Hier verschijnen binnenkort de eerste artikelen.',
  'post.back': 'Alle artikelen',
  'about.title': 'Over',
  'about.description': 'Over Stefan: ervaring, skills en wat ik bouw.',
  'about.heading': 'Over mij',
  'about.lead': 'Ik ben Stefan, frontend developer en designer. Ik studeer aan de Frontend Design & Development-opleiding van de HvA en bouw daarnaast mijn eigen tools.',
  'about.portrait': 'Portret van Stefan',
  'about.experience': 'Ervaring',
  'about.present': 'heden',
  'about.kind.werk': 'Werk',
  'about.kind.opleiding': 'Opleiding',
  'about.skills': 'Skills',
  'about.github': 'Recent op GitHub',
  'about.cv': 'Download mijn cv (pdf)',
  'contact.title': 'Contact',
  'contact.description': 'Neem contact op met Stefan voor een opdracht, samenwerking of vraag.',
  'contact.heading': 'Contact',
  'contact.lead': 'Een opdracht, een samenwerking of gewoon een vraag? Stuur me een bericht.',
  'contact.other': 'Of via',
  'form.name': 'Naam',
  'form.email': 'E-mailadres',
  'form.message': 'Bericht',
  'form.send': 'Versturen',
  'form.sending': 'Versturen…',
  'form.success': 'Bedankt! Je bericht is verstuurd.',
  'form.error': 'Versturen is mislukt. Probeer het later opnieuw of mail me direct.',
  'form.noJs': 'Het formulier werkt met JavaScript. Mail me anders direct:',
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
  'home.clients': 'Worked with',
  'home.other': 'Other work',
  'home.about': 'About me',
  'home.aboutText': "I'm Stefan, a frontend developer and designer. I build fast, accessible websites and the tools I make them with: my own framework and my own CMS.",
  'home.aboutLink': 'More about me',
  'home.blog': 'From the blog',
  'home.cta': "Let's talk?",
  'type.framework': 'Framework',
  'type.product': 'Product',
  'type.website': 'Website',
  'type.school': 'School project',
  'work.title': 'Work',
  'work.description': "All of Stefan's projects: frameworks, products, websites and school projects.",
  'work.heading': 'Work',
  'work.lead': 'From my own frameworks to websites for clients.',
  'work.filterLabel': 'Filter by type',
  'work.filterAll': 'All',
  'work.count': '{n} projects',
  'project.process': 'From problem to result',
  'project.problem': 'Problem',
  'project.approach': 'Approach',
  'project.result': 'Result',
  'project.metrics': 'In numbers',
  'project.details': 'Stack and links',
  'project.stack': 'Stack',
  'project.live': 'View live',
  'project.repo': 'Source code',
  'project.design': 'Design',
  'project.npm': 'npm package',
  'project.gallery': 'Images',
  'project.client': 'Client',
  'blog.title': 'Blog',
  'blog.description': 'Articles by Stefan about web development, design and building your own tools.',
  'blog.heading': 'Blog',
  'blog.empty': 'The first articles will appear here soon.',
  'post.back': 'All articles',
  'about.title': 'About',
  'about.description': 'About Stefan: experience, skills and what I build.',
  'about.heading': 'About me',
  'about.lead': "I'm Stefan, a frontend developer and designer. I study Frontend Design & Development at the Amsterdam University of Applied Sciences and build my own tools on the side.",
  'about.portrait': 'Portrait of Stefan',
  'about.experience': 'Experience',
  'about.present': 'present',
  'about.kind.werk': 'Work',
  'about.kind.opleiding': 'Education',
  'about.skills': 'Skills',
  'about.github': 'Recently on GitHub',
  'about.cv': 'Download my CV (pdf)',
  'contact.title': 'Contact',
  'contact.description': 'Get in touch with Stefan about a project, collaboration or question.',
  'contact.heading': 'Contact',
  'contact.lead': 'A project, a collaboration or just a question? Send me a message.',
  'contact.other': 'Or via',
  'form.name': 'Name',
  'form.email': 'Email address',
  'form.message': 'Message',
  'form.send': 'Send',
  'form.sending': 'Sending…',
  'form.success': 'Thanks! Your message has been sent.',
  'form.error': 'Sending failed. Please try again later or email me directly.',
  'form.noJs': 'The form needs JavaScript. Otherwise email me directly:',
  'footer.text': 'Built with WaldJS, GSAP and Centaur CMS.',
  'notFound.title': 'Page not found',
  'notFound.body': 'This page does not exist (anymore).',
  'notFound.back': 'Back to home'
}
```

Voeg onderaan `src/lib/i18n.ts` toe:

```ts
const intlLocale = (locale: Locale) => (locale === 'nl' ? 'nl-NL' : 'en-GB')

function toDate(iso: string): Date | null {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

/** "1 mei 2024" / "1 May 2024"; lege string bij een ongeldige datum. */
export function formatDate(iso: string, locale: Locale): string {
  const date = toDate(iso)
  return date ? new Intl.DateTimeFormat(intlLocale(locale), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date) : ''
}

/** "sep 2023" / "Sept 2023" (voor de cv-tijdlijn). */
export function formatMonth(iso: string, locale: Locale): string {
  const date = toDate(iso)
  return date ? new Intl.DateTimeFormat(intlLocale(locale), { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date).replace('.', '') : ''
}
```

Voeg onderaan `src/lib/site.ts` toe:

```ts
/** Contactadres voor de mailto-link op /contact. Pas hier aan als het adres verandert. */
export const CONTACT_EMAIL = 'info@espant.com'

export const GITHUB_URL = 'https://github.com/Stefan-Espant'
```

- [ ] **Step 4: Tests draaien en zien slagen**

Run: `npx vitest run && npm run check`
Expected: alles groen.

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n.ts src/lib/i18n.test.ts src/lib/site.ts
git commit -m "feat: UI messages for all pages and date formatting"
```

---

### Task 4: Kaarten en de horizontale strook

**Files:**
- Create: `src/components/ProjectCard.wald`, `src/components/PostCard.wald`, `src/components/HScroll.wald`

- [ ] **Step 1: `src/components/ProjectCard.wald`**

```wald
---
import { localePath, t, type Locale, type MessageKey } from '../lib/i18n'
import type { Project } from '../lib/content'
type Props = { project: Project, locale: Locale, headingLevel?: 2 | 3, size?: 'large' | 'normal' }
const { project, locale, headingLevel = 3, size = 'normal' } = $$props
const heading = new SafeHtml(headingLevel === 2 ? 'h2' : 'h3')
const title = renderTemplate`<${heading} class="project-card__title display">${project.title}</${heading}>`
// Decoratief: de titel is de linktekst.
const cover = project.cover
  ? renderTemplate`<img class="project-card__cover" src="${project.cover}" alt="" loading="lazy" decoding="async">`
  : ''
const meta = [t(`type.${project.type}` as MessageKey, locale), project.year ? String(project.year) : ''].filter(Boolean).join(' · ')
---
<a class="project-card" data-size={size} href={localePath('project', locale, project.slug)}>
  {new SafeHtml(cover)}
  <div class="project-card__body">
    {new SafeHtml(title)}
    <p class="project-card__summary">{project.summary}</p>
    <p class="project-card__meta">{meta}</p>
  </div>
</a>

<style>
.project-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  color: var(--text-muted);
  text-decoration: none;
  transition: border-color 0.2s var(--ease-out);

  &:hover,
  &:focus-visible {
    border-color: var(--accent);
    color: var(--text-muted);
  }
  & .project-card__cover {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-bottom: 1px solid var(--border);
  }
  & .project-card__body {
    display: grid;
    gap: var(--space-2);
    padding: var(--space-6);
  }
  & .project-card__title {
    font-size: var(--text-lg);
  }
  &[data-size='large'] .project-card__title {
    font-size: var(--text-xl);
  }
  & .project-card__summary,
  & .project-card__meta {
    margin: 0;
  }
  & .project-card__meta {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }
}
</style>
```

- [ ] **Step 2: `src/components/PostCard.wald`**

```wald
---
import { formatDate, localePath, type Locale } from '../lib/i18n'
import type { Post } from '../lib/content'
type Props = { post: Post, locale: Locale, headingLevel?: 2 | 3 }
const { post, locale, headingLevel = 3 } = $$props
const heading = new SafeHtml(headingLevel === 2 ? 'h2' : 'h3')
const title = renderTemplate`<${heading} class="post-card__title">${post.title}</${heading}>`
---
<a class="post-card" href={localePath('post', locale, post.slug)}>
  <time class="post-card__date" datetime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
  {new SafeHtml(title)}
  <p class="post-card__excerpt">{post.excerpt}</p>
</a>

<style>
.post-card {
  display: grid;
  align-content: start;
  gap: var(--space-2);
  height: 100%;
  padding: var(--space-6);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  color: var(--text-muted);
  text-decoration: none;

  &:hover,
  &:focus-visible {
    border-color: var(--accent);
    color: var(--text-muted);
  }
  & .post-card__date {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }
  & .post-card__title {
    color: var(--text);
    font-size: var(--text-lg);
  }
  & .post-card__excerpt {
    margin: 0;
  }
}
</style>
```

- [ ] **Step 3: `src/components/HScroll.wald`**

```wald
---
// Horizontale strook (spec: Motion #6). Zonder JavaScript een swipe-lijst met scroll-snap;
// plan 3 pint hem op desktop en toont dan de teller en de voortgangsbalk.
type Props = { id: string, title: string, items: string[] }
const { id, title, items } = $$props
const list = items.map(item => `<li class="hscroll__item">${item}</li>`).join('')
const count = String(items.length).padStart(2, '0')
---
<section class="hscroll" data-motion="hscroll" aria-labelledby={id}>
  <div class="hscroll__head container">
    <h2 class="hscroll__title display" id={id}>{title}</h2>
    <span class="hscroll__counter" aria-hidden="true"><b data-hscroll-current>01</b> / {count}</span>
  </div>
  <ul class="hscroll__track" role="list">{new SafeHtml(list)}</ul>
  <div class="hscroll__progress" aria-hidden="true"><i></i></div>
</section>

<style>
.hscroll {
  /* Start van de strook gelijk met de container, ook op brede schermen. */
  --track-inset: max(var(--page-gutter), calc((100% - var(--page-width)) / 2));
  padding-block: var(--space-16);

  & .hscroll__head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-4);
  }
  & .hscroll__title {
    font-size: var(--text-xl);
  }
  & .hscroll__counter {
    display: none;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
  & .hscroll__counter b {
    color: var(--accent);
    font-weight: 600;
  }
  & .hscroll__track {
    display: flex;
    gap: var(--space-4);
    margin: var(--space-6) 0 0;
    padding: 0 var(--track-inset) var(--space-4);
    list-style: none;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: var(--track-inset);
  }
  & .hscroll__item {
    flex: 0 0 min(78vw, 22rem);
    scroll-snap-align: start;
  }
  & .hscroll__progress {
    display: none;
    height: 2px;
    margin: var(--space-6) var(--track-inset) 0;
    background: var(--border);
  }
  & .hscroll__progress i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    transform-origin: left;
    transform: scaleX(0);
  }
}
</style>
```

- [ ] **Step 4: Controleren en committen**

Run: `npm run check`
Expected: geen fouten.

```bash
git add src/components/ProjectCard.wald src/components/PostCard.wald src/components/HScroll.wald
git commit -m "feat: project and post cards and horizontal strip component"
```

---

### Task 5: Home-onderdelen

**Files:**
- Create: `src/components/Bento.wald`, `src/components/Marquee.wald`, `src/components/ClientRow.wald`, `src/components/Availability.wald`

- [ ] **Step 1: `src/components/Bento.wald`**

```wald
---
import ProjectCard from './ProjectCard.wald'
import type { Locale } from '../lib/i18n'
import type { Project } from '../lib/content'
type Props = { projects: Project[], locale: Locale }
const { projects, locale } = $$props
const cards = await Promise.all(projects.map(async (project, index) => {
  const size = index === 0 ? 'large' : 'normal'
  return `<li class="bento__item${index === 0 ? ' bento__item--large' : ''}">${await ProjectCard.render({ project, locale, size })}</li>`
}))
---
<ul class="bento" role="list" data-motion="bento">{new SafeHtml(cards.join(''))}</ul>

<style>
.bento {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  margin: var(--space-6) 0 0;
  padding: 0;
  list-style: none;

  @media (min-width: 48rem) {
    grid-template-columns: 1.4fr 1fr;

    & .bento__item--large {
      grid-row: span 2;
    }
  }
}
</style>
```

- [ ] **Step 2: `src/components/Marquee.wald`**

```wald
---
// Decoratieve band met projectnamen (spec: Motion #5). Alleen sier: aria-hidden.
type Props = { names: string[] }
const { names } = $$props
const run = names.map(name => renderTemplate`<span>${name}</span>`).join('')
---
<div class="marquee" aria-hidden="true" data-motion="marquee">
  <div class="marquee__track">{new SafeHtml(run + run + run)}</div>
</div>

<style>
.marquee {
  overflow: hidden;
  margin-block: var(--space-16);
  padding-block: var(--space-4);
  border-block: 1px solid var(--border);
  white-space: nowrap;

  & .marquee__track {
    display: inline-flex;
    gap: var(--space-12);
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 1.5rem + 4vw, 5rem);
    line-height: 1.2;
    color: transparent;
    -webkit-text-stroke: 1px #5b6478;
    will-change: transform;
  }
  & .marquee__track span:nth-child(3n + 1) {
    -webkit-text-stroke: 0;
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text;
    background-clip: text;
  }
}
</style>
```

- [ ] **Step 3: `src/components/ClientRow.wald`**

```wald
---
import { t, type Locale } from '../lib/i18n'
import type { Client } from '../lib/content'
type Props = { clients: Client[], locale: Locale }
const { clients, locale } = $$props
const items = clients.map(client => {
  const inner = client.logo
    ? renderTemplate`<img src="${client.logo}" alt="${client.name}" loading="lazy" decoding="async">`
    : renderTemplate`<span>${client.name}</span>`
  return client.url
    ? renderTemplate`<li><a href="${client.url}" rel="noopener">${new SafeHtml(inner)}</a></li>`
    : renderTemplate`<li>${new SafeHtml(inner)}</li>`
}).join('')
const withQuote = clients.find(client => client.quote)
const quote = withQuote
  ? renderTemplate`<blockquote class="clients__quote"><p>${withQuote.quote}</p><footer>${withQuote.quoteAuthor || withQuote.name}</footer></blockquote>`
  : ''
---
<section class="clients container" aria-labelledby="clients-title">
  <h2 class="clients__title display" id="clients-title">{t('home.clients', locale)}</h2>
  <ul class="clients__list" role="list">{new SafeHtml(items)}</ul>
  {new SafeHtml(quote)}
</section>

<style>
.clients {
  padding-block: var(--space-16);

  & .clients__title {
    font-size: var(--text-xl);
  }
  & .clients__list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-4) var(--space-12);
    margin: var(--space-6) 0 0;
    padding: 0;
    list-style: none;
    font-family: var(--font-mono);
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  & .clients__list a {
    color: inherit;
    text-decoration: none;
  }
  & .clients__list a:hover {
    color: var(--text);
  }
  & .clients__list img {
    height: 2rem;
    width: auto;
    opacity: 0.8;
  }
  & .clients__quote {
    max-width: 46rem;
    margin: var(--space-8) 0 0;
    padding: var(--space-6) var(--space-8);
    border-left: 3px solid var(--accent);
    border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
    background: var(--surface);
  }
  & .clients__quote p {
    font-size: var(--text-lg);
    font-style: italic;
    quotes: '“' '”';
  }
  & .clients__quote p::before { content: open-quote; }
  & .clients__quote p::after { content: close-quote; }
  & .clients__quote footer {
    margin-top: var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
}
</style>
```

- [ ] **Step 4: `src/components/Availability.wald`**

```wald
---
import type { Status } from '../lib/content'
type Props = { status: Status }
const { status } = $$props
---
<p class="availability" data-available={status.available ? 'true' : 'false'}>
  <span class="availability__dot" aria-hidden="true"></span>{status.text}
</p>

<style>
.availability {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  font-family: var(--font-mono);
  font-size: var(--text-sm);

  & .availability__dot {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background: var(--text-muted);
  }
  &[data-available='true'] .availability__dot {
    background: var(--accent);
    animation: availability-pulse 2s infinite;
  }
}
@keyframes availability-pulse {
  0% { box-shadow: 0 0 0 0 rgb(255 176 0 / 0.6); }
  70% { box-shadow: 0 0 0 0.6rem rgb(255 176 0 / 0); }
  100% { box-shadow: 0 0 0 0 rgb(255 176 0 / 0); }
}
@media (prefers-reduced-motion: reduce) {
  .availability .availability__dot {
    animation: none;
  }
}
</style>
```

- [ ] **Step 5: Controleren en committen**

Run: `npm run check`

```bash
git add src/components/Bento.wald src/components/Marquee.wald src/components/ClientRow.wald src/components/Availability.wald
git commit -m "feat: bento, marquee, client row and availability components"
```

---

### Task 6: Home herbouwen

**Files:**
- Modify: `src/components/pages/HomePage.wald` (volledig vervangen)

- [ ] **Step 1: `src/components/pages/HomePage.wald` vervangen**

```wald
---
import Layout from '../../layouts/Layout.wald'
import Bento from '../Bento.wald'
import Marquee from '../Marquee.wald'
import ClientRow from '../ClientRow.wald'
import HScroll from '../HScroll.wald'
import ProjectCard from '../ProjectCard.wald'
import PostCard from '../PostCard.wald'
import Availability from '../Availability.wald'
import { getClients, getFeaturedProjects, getOtherProjects, getPosts, getStatus } from '../../lib/content'
import { localePath, t, type Locale } from '../../lib/i18n'
type Props = { locale: Locale }
const { locale } = $$props
const [featured, other, posts, clients, status] = await Promise.all([
  getFeaturedProjects(locale), getOtherProjects(locale), getPosts(locale), getClients(locale), getStatus(locale)
])

const featuredHtml = featured.length
  ? await Bento.render({ projects: featured, locale })
  : renderTemplate`<p class="home__empty">${t('home.empty', locale)}</p>`
const names = [...featured, ...other].map(project => project.title)
const marqueeHtml = names.length >= 3 ? await Marquee.render({ names }) : ''
const clientsHtml = clients.length ? await ClientRow.render({ clients, locale }) : ''
const otherHtml = other.length
  ? await HScroll.render({ id: 'other-work', title: t('home.other', locale), items: await Promise.all(other.map(project => ProjectCard.render({ project, locale }))) })
  : ''
const latest = posts.slice(0, 6)
const blogHtml = latest.length
  ? await HScroll.render({ id: 'latest-posts', title: t('home.blog', locale), items: await Promise.all(latest.map(post => PostCard.render({ post, locale }))) })
  : ''
const statusHtml = status ? await Availability.render({ status, locale }) : ''
const alternates = { nl: localePath('home', 'nl'), en: localePath('home', 'en') }
---
<Layout title={t('home.title', locale)} fullTitle={true} description={t('home.description', locale)} path={localePath('home', locale)} locale={locale} alternates={alternates}>
  <main id="main" class="home">
    <header class="home__hero container" data-motion="intro">
      <h1 class="home__title">{t('home.heading', locale)}</h1>
      <p class="home__lead">{t('home.lead', locale)}</p>
    </header>

    <section class="home__featured container" aria-labelledby="featured-title">
      <h2 class="home__section-title display" id="featured-title">{t('home.featured', locale)}</h2>
      {new SafeHtml(featuredHtml)}
    </section>

    {new SafeHtml(marqueeHtml)}
    {new SafeHtml(clientsHtml)}
    {new SafeHtml(otherHtml)}

    <section class="home__about container" aria-labelledby="about-title">
      <h2 class="home__section-title display" id="about-title">{t('home.about', locale)}</h2>
      <p class="home__about-text">{t('home.aboutText', locale)}</p>
      <a class="home__about-link" href={localePath('about', locale)}>{t('home.aboutLink', locale)} →</a>
    </section>

    {new SafeHtml(blogHtml)}

    <section class="home__cta container">
      {new SafeHtml(statusHtml)}
      <a class="home__cta-link display" href={localePath('contact', locale)}>{t('home.cta', locale)}</a>
    </section>
  </main>
</Layout>

<style>
.home {
  & .home__hero {
    min-height: min(80vh, 48rem);
    display: grid;
    align-content: center;
    padding-block: var(--space-16);
  }
  & .home__title {
    max-width: 13ch;
    font-size: clamp(2.75rem, 1.6rem + 5.5vw, 6.5rem);
    font-weight: 700;
    line-height: 0.98;
  }
  & .home__lead {
    margin-top: var(--space-6);
    max-width: 38ch;
    color: var(--text-muted);
    font-size: var(--text-lg);
  }
  & .home__featured,
  & .home__about {
    padding-block: var(--space-16);
  }
  & .home__section-title {
    font-size: var(--text-xl);
  }
  & .home__empty,
  & .home__about-text {
    margin-top: var(--space-6);
    max-width: 60ch;
    color: var(--text-muted);
    font-size: var(--text-lg);
  }
  & .home__about-link {
    display: inline-block;
    margin-top: var(--space-4);
    font-family: var(--font-mono);
  }
  & .home__cta {
    display: grid;
    justify-items: center;
    gap: var(--space-6);
    padding-block: var(--space-24);
    text-align: center;
  }
  & .home__cta-link {
    font-size: clamp(2.5rem, 1.5rem + 5vw, 6rem);
    text-decoration: none;
  }
}
</style>
```

- [ ] **Step 2: Controleren**

```bash
npm run check && npm run build
python3 -I -m http.server 4322 --bind 127.0.0.1 -d .vercel/output/static &
sleep 1
curl -s http://127.0.0.1:4322/ | grep -oE 'home__title|featured-title|about-title|home__cta-link|Zullen we praten' | sort -u
curl -s http://127.0.0.1:4322/en/ | grep -oE "Let.s talk|About me" | sort -u
```

Expected: alle strings komen terug. Zolang er geen gepubliceerde projecten zijn, staat bij "Uitgelicht werk" de lege staat en ontbreken marquee, klanten en stroken; dat is correct. Screenshot `/` op 1280 en 390 breed. Stop daarna de 4322-server.

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/HomePage.wald
git commit -m "feat: full home page with bento, marquee, clients, strips and CTA"
```

---

### Task 7: Werk-overzicht met filter

**Files:**
- Create: `src/components/pages/WorkPage.wald`, `public/filter.js`, `src/pages/werk/index.wald`, `src/pages/en/work/index.wald`

- [ ] **Step 1: `src/components/pages/WorkPage.wald`**

```wald
---
import Layout from '../../layouts/Layout.wald'
import ProjectCard from '../ProjectCard.wald'
import { getProjects, PROJECT_TYPES } from '../../lib/content'
import { localePath, t, type Locale, type MessageKey } from '../../lib/i18n'
type Props = { locale: Locale }
const { locale } = $$props
const projects = await getProjects(locale)
const cards = await Promise.all(projects.map(async project =>
  renderTemplate`<li class="work__item" data-filter-item data-type="${project.type}">${new SafeHtml(await ProjectCard.render({ project, locale, headingLevel: 2 }))}</li>`))
// Alleen types die echt voorkomen, in de vaste volgorde van PROJECT_TYPES.
const types = PROJECT_TYPES.filter(type => projects.some(project => project.type === type))
const buttons = [
  renderTemplate`<button type="button" data-value="all" aria-pressed="true">${t('work.filterAll', locale)}</button>`,
  ...types.map(type => renderTemplate`<button type="button" data-value="${type}" aria-pressed="false">${t(`type.${type}` as MessageKey, locale)}</button>`)
].join('')
const filters = types.length > 1
  ? renderTemplate`<div class="work__filters" role="group" aria-label="${t('work.filterLabel', locale)}" data-filter hidden>${new SafeHtml(buttons)}</div>
    <p class="sr-only" aria-live="polite" data-filter-status data-template="${t('work.count', locale)}"></p>`
  : ''
const list = projects.length
  ? `<ul class="work__grid" role="list">${cards.join('')}</ul>`
  : renderTemplate`<p class="work__empty">${t('home.empty', locale)}</p>`
const alternates = { nl: localePath('work', 'nl'), en: localePath('work', 'en') }
---
<Layout title={t('work.title', locale)} description={t('work.description', locale)} path={localePath('work', locale)} locale={locale} alternates={alternates} current="work">
  <main id="main" class="work container">
    <h1 class="work__title">{t('work.heading', locale)}</h1>
    <p class="work__lead">{t('work.lead', locale)}</p>
    {new SafeHtml(filters)}
    {new SafeHtml(list)}
  </main>
  <script src="/filter.js" defer data-wald-no-hoist></script>
</Layout>

<style>
.work {
  padding-block: var(--space-16);

  & .work__title {
    font-size: var(--text-2xl);
  }
  & .work__lead,
  & .work__empty {
    margin-top: var(--space-4);
    color: var(--text-muted);
    font-size: var(--text-lg);
  }
  & .work__filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-8);
  }
  & .work__filters button {
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--border);
    border-radius: 999px;
    background: transparent;
    color: var(--text-muted);
    font: inherit;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    cursor: pointer;
  }
  & .work__filters button[aria-pressed='true'] {
    border-color: var(--accent);
    color: var(--text);
  }
  & .work__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
    gap: var(--space-4);
    margin: var(--space-8) 0 0;
    padding: 0;
    list-style: none;
  }
  & .work__item[hidden] {
    display: none;
  }
}
</style>
```

- [ ] **Step 2: `public/filter.js`**

```js
// Typefilter op /werk (spec: Sitemap). Zonder JavaScript blijven de knoppen verborgen en staat
// de volledige lijst er.
document.querySelectorAll('[data-filter]').forEach(function (group) {
  var items = document.querySelectorAll('[data-filter-item]')
  var status = document.querySelector('[data-filter-status]')
  group.hidden = false
  group.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-value]')
    if (!button) return
    group.querySelectorAll('button').forEach(function (other) {
      other.setAttribute('aria-pressed', String(other === button))
    })
    var shown = 0
    items.forEach(function (item) {
      var show = button.dataset.value === 'all' || item.dataset.type === button.dataset.value
      item.hidden = !show
      if (show) shown++
    })
    if (status) status.textContent = status.dataset.template.replace('{n}', String(shown))
  })
})
```

- [ ] **Step 3: Routes**

`src/pages/werk/index.wald`:

```wald
---
import WorkPage from '../../components/pages/WorkPage.wald'
---
<WorkPage locale="nl" />
```

`src/pages/en/work/index.wald`:

```wald
---
import WorkPage from '../../../components/pages/WorkPage.wald'
---
<WorkPage locale="en" />
```

- [ ] **Step 4: Controleren**

`npm run check && npm run build`; serve op 4322; `curl -s http://127.0.0.1:4322/werk/ | grep -oE 'aria-current="page"|work__title|filter.js'` en idem `/en/work/`. Expected: alle drie. Screenshot. Stop de server.

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/WorkPage.wald public/filter.js src/pages/werk src/pages/en/work
git commit -m "feat: work overview with progressive type filter"
```

---

### Task 8: Case study

**Files:**
- Create: `src/components/Metrics.wald`, `src/components/Timeline.wald`, `src/components/pages/ProjectPage.wald`, `src/pages/werk/[slug].wald`, `src/pages/en/work/[slug].wald`

- [ ] **Step 1: `src/components/Metrics.wald`**

```wald
---
import type { Metric } from '../lib/content'
type Props = { id: string, title: string, metrics: Metric[] }
const { id, title, metrics } = $$props
const items = metrics.map(metric =>
  renderTemplate`<li class="metrics__item"><strong class="metrics__value" data-motion="count">${metric.value}</strong><span class="metrics__label">${metric.label}</span></li>`).join('')
---
<section class="metrics container" aria-labelledby={id}>
  <h2 class="metrics__title display" id={id}>{title}</h2>
  <ul class="metrics__list" role="list">{new SafeHtml(items)}</ul>
</section>

<style>
.metrics {
  padding-block: var(--space-12);

  & .metrics__title {
    font-size: var(--text-xl);
  }
  & .metrics__list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: var(--space-4);
    margin: var(--space-6) 0 0;
    padding: 0;
    list-style: none;
  }
  & .metrics__item {
    display: grid;
    gap: var(--space-2);
    padding: var(--space-6);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface);
  }
  & .metrics__value {
    font-size: clamp(2.5rem, 2rem + 2vw, 3.5rem);
    line-height: 1;
    font-variation-settings: 'opsz' 144;
  }
  & .metrics__label {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
}
</style>
```

- [ ] **Step 2: `src/components/Timeline.wald`**

```wald
---
// Proces als tijdlijn (spec: Motion, `timeline`). Statisch: verticale tijdlijn met alle stappen
// actief. Plan 3 maakt er op desktop een gepinde horizontale tijdlijn van.
type Props = { id: string, title: string, steps: Array<{ title: string, html: string }> }
const { id, title, steps } = $$props
const list = steps.map((step, index) => renderTemplate`
  <li class="timeline__step">
    <span class="timeline__num" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
    <span class="timeline__dot" aria-hidden="true"></span>
    <h3 class="timeline__step-title">${step.title}</h3>
    <div class="timeline__text">${new SafeHtml(step.html)}</div>
  </li>`).join('')
---
<section class="timeline" data-motion="timeline" aria-labelledby={id}>
  <div class="container">
    <h2 class="timeline__title display" id={id}>{title}</h2>
  </div>
  <div class="timeline__body container">
    <div class="timeline__line" aria-hidden="true"><i></i></div>
    <ol class="timeline__track" role="list">{new SafeHtml(list)}</ol>
  </div>
</section>

<style>
.timeline {
  padding-block: var(--space-16);

  & .timeline__title {
    font-size: var(--text-xl);
  }
  & .timeline__body {
    position: relative;
    margin-top: var(--space-8);
  }
  & .timeline__line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(var(--page-gutter) + 9px);
    width: 2px;
    background: linear-gradient(var(--accent), var(--accent-2));
  }
  & .timeline__line i {
    display: none;
  }
  & .timeline__track {
    display: grid;
    gap: var(--space-12);
    margin: 0;
    padding: 0 0 0 var(--space-12);
    list-style: none;
  }
  & .timeline__step {
    position: relative;
  }
  & .timeline__num {
    display: block;
    font-family: var(--font-display);
    font-size: 4.5rem;
    line-height: 1;
    color: var(--accent);
  }
  & .timeline__dot {
    position: absolute;
    top: 1.6rem;
    left: calc(-1 * var(--space-12));
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--accent);
  }
  & .timeline__step-title {
    margin-top: var(--space-4);
    font-size: var(--text-xl);
  }
  & .timeline__text {
    margin-top: var(--space-3);
    max-width: 60ch;
    color: var(--text-muted);
  }
  & .timeline__text > * + * {
    margin-top: var(--space-3);
  }
}
</style>
```

- [ ] **Step 3: `src/components/pages/ProjectPage.wald`**

```wald
---
import Layout from '../../layouts/Layout.wald'
import Metrics from '../Metrics.wald'
import Timeline from '../Timeline.wald'
import HScroll from '../HScroll.wald'
import { getProject, projectAlternates } from '../../lib/content'
import { localePath, t, type Locale, type MessageKey } from '../../lib/i18n'
type Props = { locale: Locale, slug: string }
const { locale, slug } = $$props
const project = await getProject(slug, locale)
// Alleen bereikbaar in `wald grow`; de build rendert alleen gepubliceerde projecten.
if (!project) throw new Error(`Project "${slug}" (${locale}) staat niet (gepubliceerd) in Centaur`)
const alternates = await projectAlternates(project)

const pills = [t(`type.${project.type}` as MessageKey, locale), project.year ? String(project.year) : '', project.client ? `${t('project.client', locale)}: ${project.client}` : '']
  .filter(Boolean).map(label => renderTemplate`<li>${label}</li>`).join('')
const metricsHtml = project.metrics.length
  ? await Metrics.render({ id: 'metrics-title', title: t('project.metrics', locale), metrics: project.metrics })
  : ''
const steps = ([
  [t('project.problem', locale), project.problemHtml],
  [t('project.approach', locale), project.approachHtml],
  [t('project.result', locale), project.resultHtml]
] as Array<[string, string]>).filter(([, html]) => html).map(([title, html]) => ({ title, html }))
const timelineHtml = steps.length ? await Timeline.render({ id: 'process-title', title: t('project.process', locale), steps }) : ''
const links = ([
  [t('project.live', locale), project.liveUrl],
  [t('project.repo', locale), project.repoUrl],
  [t('project.design', locale), project.designUrl],
  [t('project.npm', locale), project.npmPackage ? `https://www.npmjs.com/package/${project.npmPackage}` : '']
] as Array<[string, string]>).filter(([, href]) => href)
  .map(([label, href]) => renderTemplate`<li><a href="${href}" rel="noopener">${label} ↗</a></li>`).join('')
const stack = project.stack.map(item => renderTemplate`<li>${item}</li>`).join('')
const detailsHtml = links || stack
  ? renderTemplate`<section class="case__details container" aria-labelledby="details-title">
      <h2 class="case__section-title display" id="details-title">${t('project.details', locale)}</h2>
      ${new SafeHtml(stack ? renderTemplate`<ul class="case__stack" role="list" aria-label="${t('project.stack', locale)}">${new SafeHtml(stack)}</ul>` : '')}
      ${new SafeHtml(links ? `<ul class="case__links" role="list">${links}</ul>` : '')}
    </section>`
  : ''
const galleryHtml = project.gallery.length
  ? await HScroll.render({
      id: 'gallery-title',
      title: t('project.gallery', locale),
      items: project.gallery.map(image => renderTemplate`<figure class="case__shot"><img src="${image.src}" alt="${image.alt}" loading="lazy" decoding="async">${new SafeHtml(image.alt ? renderTemplate`<figcaption>${image.alt}</figcaption>` : '')}</figure>`)
    })
  : ''
const cover = project.cover
  ? renderTemplate`<img class="case__cover" src="${project.cover}" alt="${project.coverAlt}" decoding="async" fetchpriority="high">`
  : ''
---
<Layout title={project.title} description={project.summary} path={localePath('project', locale, project.slug)} locale={locale} alternates={alternates} current="work">
  <main id="main" class="case">
    <header class="case__header container">
      <p class="case__crumb"><a href={localePath('work', locale)}>{t('nav.work', locale)}</a> / {project.title}</p>
      <h1 class="case__title display">{project.title}</h1>
      <p class="case__summary">{project.summary}</p>
      <ul class="case__pills" role="list">{new SafeHtml(pills)}</ul>
    </header>
    <div class="container">{new SafeHtml(cover)}</div>
    {new SafeHtml(metricsHtml)}
    {new SafeHtml(timelineHtml)}
    {new SafeHtml(detailsHtml)}
    {new SafeHtml(galleryHtml)}
  </main>
</Layout>

<style>
.case {
  & .case__header {
    padding-block: var(--space-16) var(--space-8);
  }
  & .case__crumb {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
  /* De projectnaam is hier de h1 in Germania: de enige uitzondering op "nooit in h1" (spec: Typografie). */
  & .case__title {
    margin-top: var(--space-2);
    font-size: clamp(3rem, 2rem + 5vw, 6.5rem);
    line-height: 1.1;
  }
  & .case__summary {
    margin-top: var(--space-4);
    max-width: 40ch;
    color: var(--text-muted);
    font-size: var(--text-lg);
  }
  & .case__pills,
  & .case__stack {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: var(--space-6) 0 0;
    padding: 0;
    list-style: none;
  }
  & .case__pills li,
  & .case__stack li {
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--border);
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
  & .case__cover {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }
  & .case__details {
    padding-block: var(--space-12);
  }
  & .case__section-title {
    font-size: var(--text-xl);
  }
  & .case__links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3) var(--space-8);
    margin: var(--space-6) 0 0;
    padding: 0;
    list-style: none;
    font-family: var(--font-mono);
  }
  & .case__shot {
    margin: 0;
  }
  & .case__shot img {
    width: 100%;
    aspect-ratio: 16 / 10;
    object-fit: cover;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }
  & .case__shot figcaption {
    margin-top: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
}
</style>
```

- [ ] **Step 4: Routes**

`src/pages/werk/[slug].wald`:

```wald
---
import ProjectPage from '../../components/pages/ProjectPage.wald'
import { getProjects } from '../../lib/content'
type Props = { slug: string }
const { slug } = $$props
export async function getStaticPaths() {
  const projects = await getProjects('nl')
  return projects.map(project => ({ params: { slug: project.slug } }))
}
---
<ProjectPage locale="nl" slug={slug} />
```

`src/pages/en/work/[slug].wald`:

```wald
---
import ProjectPage from '../../../components/pages/ProjectPage.wald'
import { getProjects } from '../../../lib/content'
type Props = { slug: string }
const { slug } = $$props
export async function getStaticPaths() {
  const projects = await getProjects('en')
  return projects.map(project => ({ params: { slug: project.slug } }))
}
---
<ProjectPage locale="en" slug={slug} />
```

- [ ] **Step 5: Controleren**

`npm run check && npm run build`. Zonder gepubliceerde projecten worden er 0 case-study-pagina's gebouwd; dat is correct (meld het dan als DONE_WITH_CONCERNS: "niet met data getest"). Is er minstens één project gepubliceerd in Centaur: `ls .vercel/output/static/werk/` toont de slug; curl de pagina en controleer `case__title`, `<html lang="nl"`, `hreflang`. Screenshot op 1280 en 390.

- [ ] **Step 6: Commit**

```bash
git add src/components/Metrics.wald src/components/Timeline.wald src/components/pages/ProjectPage.wald "src/pages/werk/[slug].wald" "src/pages/en/work/[slug].wald"
git commit -m "feat: case study page with metrics, timeline, details and gallery"
```

---

### Task 9: Blog

**Files:**
- Create: `src/components/pages/BlogIndexPage.wald`, `src/components/pages/BlogPostPage.wald`, `src/pages/blog/index.wald`, `src/pages/blog/[slug].wald`, `src/pages/en/blog/index.wald`, `src/pages/en/blog/[slug].wald`

- [ ] **Step 1: `src/components/pages/BlogIndexPage.wald`**

```wald
---
import Layout from '../../layouts/Layout.wald'
import PostCard from '../PostCard.wald'
import { getPosts } from '../../lib/content'
import { localePath, t, type Locale } from '../../lib/i18n'
type Props = { locale: Locale }
const { locale } = $$props
const posts = await getPosts(locale)
const cards = await Promise.all(posts.map(async post => `<li>${await PostCard.render({ post, locale, headingLevel: 2 })}</li>`))
const list = posts.length
  ? `<ul class="blog__grid" role="list">${cards.join('')}</ul>`
  : renderTemplate`<p class="blog__empty">${t('blog.empty', locale)}</p>`
const alternates = { nl: localePath('blog', 'nl'), en: localePath('blog', 'en') }
---
<Layout title={t('blog.title', locale)} description={t('blog.description', locale)} path={localePath('blog', locale)} locale={locale} alternates={alternates} current="blog">
  <main id="main" class="blog container">
    <h1 class="blog__title">{t('blog.heading', locale)}</h1>
    {new SafeHtml(list)}
  </main>
</Layout>

<style>
.blog {
  padding-block: var(--space-16);

  & .blog__title {
    font-size: var(--text-2xl);
  }
  & .blog__empty {
    margin-top: var(--space-6);
    color: var(--text-muted);
    font-size: var(--text-lg);
  }
  & .blog__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
    gap: var(--space-4);
    margin: var(--space-8) 0 0;
    padding: 0;
    list-style: none;
  }
}
</style>
```

- [ ] **Step 2: `src/components/pages/BlogPostPage.wald`**

```wald
---
import Layout from '../../layouts/Layout.wald'
import { getPost, postAlternates } from '../../lib/content'
import { formatDate, localePath, t, type Locale } from '../../lib/i18n'
type Props = { locale: Locale, slug: string }
const { locale, slug } = $$props
const post = await getPost(slug, locale)
if (!post) throw new Error(`Blogpost "${slug}" (${locale}) staat niet (gepubliceerd) in Centaur`)
const alternates = await postAlternates(post)
const tags = post.tags.length ? `<ul class="post__tags" role="list">${post.tags.map(tag => renderTemplate`<li>${tag}</li>`).join('')}</ul>` : ''
const cover = post.cover ? renderTemplate`<img class="post__cover" src="${post.cover}" alt="${post.coverAlt}" decoding="async">` : ''
---
<Layout title={post.title} description={post.excerpt} path={localePath('post', locale, post.slug)} locale={locale} alternates={alternates} current="blog">
  <main id="main" class="post container">
    <article>
      <header class="post__header">
        <p class="post__crumb"><a href={localePath('blog', locale)}>{t('post.back', locale)}</a></p>
        <h1 class="post__title">{post.title}</h1>
        <time class="post__date" datetime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
        {new SafeHtml(tags)}
      </header>
      {new SafeHtml(cover)}
      <div class="post__body">{new SafeHtml(post.bodyHtml)}</div>
    </article>
  </main>
</Layout>

<style>
.post {
  max-width: calc(46rem + 2 * var(--page-gutter));
  padding-block: var(--space-16);

  & .post__crumb,
  & .post__date {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
  & .post__title {
    margin-block: var(--space-4);
    font-size: var(--text-2xl);
  }
  & .post__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: var(--space-4) 0 0;
    padding: 0;
    list-style: none;
  }
  & .post__tags li {
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--border);
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
  & .post__cover {
    width: 100%;
    margin-top: var(--space-8);
    border-radius: var(--radius-lg);
  }
  & .post__body {
    margin-top: var(--space-8);
    font-size: var(--text-base);
  }
  & .post__body > * + * {
    margin-top: var(--space-4);
  }
  & .post__body h2,
  & .post__body h3 {
    margin-top: var(--space-8);
  }
  & .post__body pre,
  & .post__body code {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }
  & .post__body pre {
    overflow-x: auto;
    padding: var(--space-4);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
  }
  & .post__body img {
    border-radius: var(--radius-sm);
  }
  & .post__body blockquote {
    padding-left: var(--space-4);
    border-left: 3px solid var(--accent);
    color: var(--text-muted);
  }
}
</style>
```

- [ ] **Step 3: Routes**

`src/pages/blog/index.wald`:

```wald
---
import BlogIndexPage from '../../components/pages/BlogIndexPage.wald'
---
<BlogIndexPage locale="nl" />
```

`src/pages/en/blog/index.wald`:

```wald
---
import BlogIndexPage from '../../../components/pages/BlogIndexPage.wald'
---
<BlogIndexPage locale="en" />
```

`src/pages/blog/[slug].wald`:

```wald
---
import BlogPostPage from '../../components/pages/BlogPostPage.wald'
import { getPosts } from '../../lib/content'
export async function getStaticPaths() {
  const posts = await getPosts('nl')
  return posts.map(post => ({ params: { slug: post.slug } }))
}
---
<BlogPostPage locale="nl" slug={$$props.slug} />
```

`src/pages/en/blog/[slug].wald`:

```wald
---
import BlogPostPage from '../../../components/pages/BlogPostPage.wald'
import { getPosts } from '../../../lib/content'
export async function getStaticPaths() {
  const posts = await getPosts('en')
  return posts.map(post => ({ params: { slug: post.slug } }))
}
---
<BlogPostPage locale="en" slug={$$props.slug} />
```

- [ ] **Step 4: Controleren en committen**

`npm run check && npm run build`; curl `/blog/` en `/en/blog/` (lege staat zolang er geen posts zijn; `aria-current="page"` op Blog). Screenshot.

```bash
git add src/components/pages/BlogIndexPage.wald src/components/pages/BlogPostPage.wald src/pages/blog src/pages/en/blog
git commit -m "feat: blog index and post pages"
```

---

### Task 10: Over-pagina

**Files:**
- Create: `src/components/pages/AboutPage.wald`, `src/pages/over.wald`, `src/pages/en/about.wald`

- [ ] **Step 1: `src/components/pages/AboutPage.wald`**

```wald
---
import Layout from '../../layouts/Layout.wald'
import { existsSync } from 'node:fs'
import { getExperience, getSkills } from '../../lib/content'
import { getRecentRepos } from '../../lib/github'
import { formatMonth, localePath, t, type Locale, type MessageKey } from '../../lib/i18n'
type Props = { locale: Locale }
const { locale } = $$props
const [experience, skills, repos] = await Promise.all([getExperience(locale), getSkills(locale), getRecentRepos()])

const experienceItems = experience.map(item => renderTemplate`
  <li class="about__job">
    <p class="about__job-meta">${formatMonth(item.start, locale)} – ${item.end ? formatMonth(item.end, locale) : t('about.present', locale)} · ${t(`about.kind.${item.kind}` as MessageKey, locale)}</p>
    <h3 class="about__job-role">${item.role}</h3>
    ${new SafeHtml(item.organisation ? renderTemplate`<p class="about__job-org">${item.organisation}</p>` : '')}
    <div class="about__job-text">${new SafeHtml(item.descriptionHtml)}</div>
  </li>`).join('')
const experienceHtml = experience.length
  ? renderTemplate`<section class="about__section" aria-labelledby="experience-title"><h2 class="about__section-title display" id="experience-title">${t('about.experience', locale)}</h2><ol class="about__jobs" role="list">${new SafeHtml(experienceItems)}</ol></section>`
  : ''

// Skills per categorie, in de volgorde waarin de categorieën voor het eerst voorkomen.
const groups = new Map<string, string[]>()
for (const skill of skills) groups.set(skill.category, [...(groups.get(skill.category) ?? []), skill.name])
const skillGroups = [...groups].map(([category, names]) => renderTemplate`
  <div class="about__skill-group">
    ${new SafeHtml(category ? renderTemplate`<h3 class="about__skill-category">${category}</h3>` : '')}
    <ul class="about__skills" role="list">${new SafeHtml(names.map(name => renderTemplate`<li>${name}</li>`).join(''))}</ul>
  </div>`).join('')
const skillsHtml = skills.length
  ? renderTemplate`<section class="about__section" aria-labelledby="skills-title"><h2 class="about__section-title display" id="skills-title">${t('about.skills', locale)}</h2><div class="about__skill-groups">${new SafeHtml(skillGroups)}</div></section>`
  : ''

const repoItems = (repos ?? []).map(repo => renderTemplate`
  <li><a class="about__repo" href="${repo.url}" rel="noopener">
    <span class="about__repo-name">${repo.name}</span>
    ${new SafeHtml(repo.description ? renderTemplate`<span class="about__repo-desc">${repo.description}</span>` : '')}
    <span class="about__repo-meta">${[repo.language, repo.stars ? `★ ${repo.stars}` : ''].filter(Boolean).join(' · ')}</span>
  </a></li>`).join('')
const githubHtml = repos?.length
  ? renderTemplate`<section class="about__section" aria-labelledby="github-title"><h2 class="about__section-title display" id="github-title">${t('about.github', locale)}</h2><ul class="about__repos" role="list">${new SafeHtml(repoItems)}</ul></section>`
  : ''

// Cv alleen tonen als het bestand er echt is (public/cv/cv-nl.pdf of cv-en.pdf).
const cvPath = `/cv/cv-${locale}.pdf`
const cvHtml = existsSync(`public${cvPath}`)
  ? renderTemplate`<a class="about__cv" href="${cvPath}" download>${t('about.cv', locale)} ↓</a>`
  : ''
const alternates = { nl: localePath('about', 'nl'), en: localePath('about', 'en') }
---
<Layout title={t('about.title', locale)} description={t('about.description', locale)} path={localePath('about', locale)} locale={locale} alternates={alternates} current="about">
  <main id="main" class="about container">
    <header class="about__header">
      <div>
        <h1 class="about__title">{t('about.heading', locale)}</h1>
        <p class="about__lead">{t('about.lead', locale)}</p>
        {new SafeHtml(cvHtml)}
      </div>
      <img class="about__portrait" src="/images/stefan/webp/stefan-376.webp" alt={t('about.portrait', locale)} width="376" height="376" decoding="async" />
    </header>
    {new SafeHtml(experienceHtml)}
    {new SafeHtml(skillsHtml)}
    {new SafeHtml(githubHtml)}
  </main>
</Layout>

<style>
.about {
  padding-block: var(--space-16);

  & .about__header {
    display: grid;
    gap: var(--space-8);
    align-items: center;

    @media (min-width: 48rem) {
      grid-template-columns: 1fr auto;
    }
  }
  & .about__title {
    font-size: var(--text-2xl);
  }
  & .about__lead {
    margin-top: var(--space-4);
    max-width: 50ch;
    color: var(--text-muted);
    font-size: var(--text-lg);
  }
  & .about__cv {
    display: inline-block;
    margin-top: var(--space-6);
    font-family: var(--font-mono);
  }
  & .about__portrait {
    width: min(100%, 16rem);
    aspect-ratio: 1;
    object-fit: cover;
    border: 1px solid var(--border);
    border-radius: 50%;
  }
  & .about__section {
    padding-top: var(--space-16);
  }
  & .about__section-title {
    font-size: var(--text-xl);
  }
  & .about__jobs,
  & .about__skills,
  & .about__repos {
    margin: var(--space-6) 0 0;
    padding: 0;
    list-style: none;
  }
  & .about__jobs {
    display: grid;
    gap: var(--space-8);
    padding-left: var(--space-6);
    border-left: 2px solid var(--border);
  }
  & .about__job-meta,
  & .about__repo-meta {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
  & .about__job-role {
    margin-top: var(--space-1);
    font-size: var(--text-lg);
  }
  & .about__job-org,
  & .about__job-text {
    color: var(--text-muted);
  }
  & .about__skill-groups {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: var(--space-8);
    margin-top: var(--space-6);
  }
  & .about__skill-category {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 400;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  & .about__skills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-3);
  }
  & .about__skills li {
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--border);
    border-radius: 999px;
    font-size: var(--text-sm);
  }
  & .about__repos {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
    gap: var(--space-4);
  }
  & .about__repo {
    display: grid;
    gap: var(--space-2);
    height: 100%;
    padding: var(--space-6);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface);
    color: var(--text-muted);
    text-decoration: none;
  }
  & .about__repo:hover,
  & .about__repo:focus-visible {
    border-color: var(--accent);
  }
  & .about__repo-name {
    color: var(--text);
    font-family: var(--font-mono);
    font-weight: 700;
  }
}
</style>
```

- [ ] **Step 2: Routes**

`src/pages/over.wald`:

```wald
---
import AboutPage from '../components/pages/AboutPage.wald'
---
<AboutPage locale="nl" />
```

`src/pages/en/about.wald`:

```wald
---
import AboutPage from '../../components/pages/AboutPage.wald'
---
<AboutPage locale="en" />
```

- [ ] **Step 3: Controleren en committen**

`npm run check && npm run build`; curl `/over/` en `/en/about/`: `about__title`, `aria-current="page"`, en (als GitHub bereikbaar is) `about__repo`. Screenshot.

```bash
git add src/components/pages/AboutPage.wald src/pages/over.wald src/pages/en/about.wald
git commit -m "feat: about page with experience, skills, GitHub and CV"
```

---

### Task 11: Contact

**Handmatig (Stefan), vóór Step 4:** maak in Centaur een **pagina** met slug `contact` en publiceer die. Centaur Forms weigert inzendingen voor een pagina die niet gepubliceerd is.

**Files:**
- Create: `src/components/ContactForm.wald`, `public/contact.js`, `src/components/pages/ContactPage.wald`, `src/pages/contact.wald`, `src/pages/en/contact.wald`

- [ ] **Step 1: `src/components/ContactForm.wald`**

```wald
---
// Contactformulier → Centaur Forms (JSON). Zonder JavaScript blijft het formulier verborgen en
// staat er een mailto-link: de Forms-API accepteert geen gewone formulier-POST.
import { t, type Locale } from '../lib/i18n'
import { CONTACT_EMAIL } from '../lib/site'
type Props = { locale: Locale }
const { locale } = $$props
const apiBase = process.env.CENTAUR_API_BASE ?? ''
const tenant = process.env.CENTAUR_TENANT_SLUG ?? ''
---
<div class="contact-form" data-contact-form data-api-base={apiBase} data-tenant={tenant} data-send={t('form.send', locale)} data-sending={t('form.sending', locale)} data-success={t('form.success', locale)} data-error={t('form.error', locale)}>
  <form hidden novalidate>
    <label class="contact-form__field">
      <span>{t('form.name', locale)}</span>
      <input name="naam" type="text" autocomplete="name" required maxlength="120" />
    </label>
    <label class="contact-form__field">
      <span>{t('form.email', locale)}</span>
      <input name="email" type="email" autocomplete="email" required maxlength="254" />
    </label>
    <label class="contact-form__field">
      <span>{t('form.message', locale)}</span>
      <textarea name="bericht" rows="6" required></textarea>
    </label>
    <button class="contact-form__submit" type="submit">{t('form.send', locale)}</button>
    <p class="contact-form__status" role="status" aria-live="polite" data-contact-status></p>
  </form>
  <noscript>
    <p class="contact-form__nojs">{t('form.noJs', locale)} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
  </noscript>
</div>

<style>
.contact-form {
  & form {
    display: grid;
    gap: var(--space-6);
    max-width: 36rem;
  }
  & .contact-form__field {
    display: grid;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
  & input,
  & textarea {
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--text);
    font: inherit;
    font-family: var(--font-serif);
    font-size: var(--text-base);
  }
  & input:focus-visible,
  & textarea:focus-visible {
    border-color: var(--accent);
  }
  & .contact-form__submit {
    justify-self: start;
    padding: var(--space-3) var(--space-6);
    border: 0;
    border-radius: 999px;
    background: var(--accent);
    color: var(--bg);
    font: inherit;
    font-family: var(--font-mono);
    font-weight: 700;
    cursor: pointer;
  }
  & .contact-form__submit:disabled {
    opacity: 0.6;
    cursor: progress;
  }
  & .contact-form__status[data-state='success'] {
    color: var(--accent);
  }
  & .contact-form__status[data-state='error'] {
    color: #ff8a7a;
  }
}
</style>
```

- [ ] **Step 2: `public/contact.js`**

```js
// Contactformulier → Centaur Forms (spec: Toegankelijkheid, Foutafhandeling). Bij een fout blijven
// de ingevulde waarden staan; de status staat in een aria-live-regio.
document.querySelectorAll('[data-contact-form]').forEach(function (root) {
  var form = root.querySelector('form')
  var button = form.querySelector('button[type=submit]')
  var status = root.querySelector('[data-contact-status]')
  var sending = false
  form.hidden = false

  form.addEventListener('submit', function (event) {
    event.preventDefault()
    if (sending || !form.reportValidity()) return
    var data = new FormData(form)
    var fields = {
      naam: String(data.get('naam') || '').trim(),
      email: String(data.get('email') || '').trim(),
      bericht: String(data.get('bericht') || '').trim()
    }
    sending = true
    button.disabled = true
    button.textContent = root.dataset.sending
    status.textContent = ''
    delete status.dataset.state

    fetch(root.dataset.apiBase.replace(/\/$/, '') + '/api/public/forms/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': root.dataset.tenant },
      body: JSON.stringify({ pageSlug: 'contact', formTitle: 'Contact portfolio', fields: fields }),
      signal: AbortSignal.timeout(8000)
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Status ' + response.status)
        form.reset()
        status.textContent = root.dataset.success
        status.dataset.state = 'success'
      })
      .catch(function () {
        status.textContent = root.dataset.error
        status.dataset.state = 'error'
      })
      .finally(function () {
        sending = false
        button.disabled = false
        button.textContent = root.dataset.send
      })
  })
})
```

- [ ] **Step 3: `src/components/pages/ContactPage.wald` en routes**

```wald
---
import Layout from '../../layouts/Layout.wald'
import ContactForm from '../ContactForm.wald'
import Availability from '../Availability.wald'
import { getStatus } from '../../lib/content'
import { getSiteSettings } from '../../lib/cms'
import { localePath, t, type Locale } from '../../lib/i18n'
import { CONTACT_EMAIL, GITHUB_URL } from '../../lib/site'
type Props = { locale: Locale }
const { locale } = $$props
const [status, site] = await Promise.all([getStatus(locale), getSiteSettings()])
const statusHtml = status ? await Availability.render({ status, locale }) : ''
const channels = ([
  ['E-mail', `mailto:${CONTACT_EMAIL}`],
  ['GitHub', GITHUB_URL],
  ['LinkedIn', site?.linkedIn ?? ''],
  ['Instagram', site?.instagram ?? '']
] as Array<[string, string]>).filter(([, href]) => href)
  .map(([label, href]) => renderTemplate`<li><a href="${href}" rel="noopener">${label} ↗</a></li>`).join('')
const alternates = { nl: localePath('contact', 'nl'), en: localePath('contact', 'en') }
---
<Layout title={t('contact.title', locale)} description={t('contact.description', locale)} path={localePath('contact', locale)} locale={locale} alternates={alternates} current="contact">
  <main id="main" class="contact container">
    <h1 class="contact__title">{t('contact.heading', locale)}</h1>
    <p class="contact__lead">{t('contact.lead', locale)}</p>
    <div class="contact__status">{new SafeHtml(statusHtml)}</div>
    <ContactForm locale={locale} />
    <h2 class="contact__other display">{t('contact.other', locale)}</h2>
    <ul class="contact__channels" role="list">{new SafeHtml(channels)}</ul>
  </main>
  <script src="/contact.js" defer data-wald-no-hoist></script>
</Layout>

<style>
.contact {
  padding-block: var(--space-16);

  & .contact__title {
    font-size: var(--text-2xl);
  }
  & .contact__lead {
    margin-top: var(--space-4);
    max-width: 46ch;
    color: var(--text-muted);
    font-size: var(--text-lg);
  }
  & .contact__status {
    margin-block: var(--space-6) var(--space-8);
  }
  & .contact__other {
    margin-top: var(--space-16);
    font-size: var(--text-xl);
  }
  & .contact__channels {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3) var(--space-8);
    margin: var(--space-4) 0 0;
    padding: 0;
    list-style: none;
    font-family: var(--font-mono);
  }
}
</style>
```

`src/pages/contact.wald`:

```wald
---
import ContactPage from '../components/pages/ContactPage.wald'
---
<ContactPage locale="nl" />
```

`src/pages/en/contact.wald`:

```wald
---
import ContactPage from '../../components/pages/ContactPage.wald'
---
<ContactPage locale="en" />
```

- [ ] **Step 4: Controleren**

`npm run check && npm run build`; curl `/contact/` en `/en/contact/`: `data-contact-form`, `<noscript>`, `contact.js`, `aria-current="page"`. **Echte inzending** (alleen nadat Stefan de Centaur-pagina `contact` heeft gepubliceerd, en met zijn akkoord, want het schrijft een inzending in Centaur): open `http://127.0.0.1:4322/contact/` in een browser en verstuur een testbericht; verwacht de succesmelding. Zonder akkoord: alleen de markup controleren.

- [ ] **Step 5: Commit**

```bash
git add src/components/ContactForm.wald public/contact.js src/components/pages/ContactPage.wald src/pages/contact.wald src/pages/en/contact.wald
git commit -m "feat: contact page with Centaur Forms and mailto fallback"
```

---

### Task 12: Eindcontrole

- [ ] **Step 1: Alles draaien**

```bash
npx vitest run && npm run check && npm run build
ls .vercel/output/static .vercel/output/static/en
```

Expected: alle tests groen, geen typefouten, build slaagt; `static/` bevat `index.html`, `werk/`, `blog/`, `over/`, `contact/`, `404/`, `en/` (met `work/`, `blog/`, `about/`, `contact/`).

- [ ] **Step 2: Links controleren**

Serve de build op 4322 en controleer dat elke interne link uit de nav en footer een 200 geeft:

```bash
for p in / /werk/ /blog/ /over/ /contact/ /en/ /en/work/ /en/blog/ /en/about/ /en/contact/; do
  printf "%s %s\n" "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4322$p)" "$p"
done
```

Expected: overal `200`.

- [ ] **Step 3: Screenshots**

Maak van elke pagina (NL) een screenshot op 1280×900 en op 390 breed (iframe-wrapper) in de scratchpad, en bekijk ze: geen horizontale scroll, geen afgesneden tekst, kopjes in Germania-saffraan, focusring zichtbaar bij Tab. Stop daarna de 4322-server.

- [ ] **Step 4: Plan 1-notities verwerkt?**

Controleer dat deze review-punten uit plan 1 in de code zitten: dubbele slugs worden afgevangen (Task 2), `year` 0 wordt niet getoond (ProjectCard en ProjectPage tonen het jaar alleen als het er is), GitHub-sectie verdwijnt bij een lege lijst (`repos?.length`), alternates bevatten alleen echte vertalingen. Meld wat ontbreekt.
