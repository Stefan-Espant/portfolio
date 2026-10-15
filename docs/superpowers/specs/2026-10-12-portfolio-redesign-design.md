# Portfolio redesign — ontwerp

**Datum:** 2026-10-12
**Status:** goedgekeurd, klaar voor implementatieplan (herzien 2026-10-15: Germania One-accent)
**Branch:** `redesign`

## Doel

Het portfolio op steefan.nl opnieuw ontwerpen en opnieuw bouwen met WaldJS, GSAP en Centaur CMS. De site toont WaldJS, Centaur CMS en Steva's Kookboek als uitgelichte projecten en is tegelijk een showcase van die eigen tools.

**Doelgroepen:** werkgevers en recruiters, opdrachtgevers en klanten, en de developer-community. De home laat binnen één scherm zien wat Stefan maakt. Per project is er een case study met de diepgang die developers en klanten zoeken.

**Werkwijze:** eerst lokaal volledig af, daarna pas publiceren (na akkoord van Stefan).

## Beslissingen

| Onderwerp | Keuze |
|---|---|
| Framework | WaldJS (statisch, alle content tijdens de build) |
| CMS | Centaur CMS voor alle content, inclusief blog |
| Animatie | GSAP 3.12.5 + ScrollTrigger, niveau "gemiddeld" plus horizontale projectrail |
| Visuele stijl | Donker developer-thema met bento-grid en de bestaande stenen textuur als donkere achtergrond |
| Lettertype | Fraunces (variabel) voor koppen en tekst, JetBrains Mono voor navigatie, labels en code, Germania One als subtiel Zuid-Duits accent (logo, sectiekopjes, projectnamen) |
| Talen | Nederlands (standaard, zonder prefix) en Engels (`/en/`) |
| Vertalingen in collecties | `locale`- en `translationKey`-velden in de entry-data |
| Bestaande content | Migratiescript DatoCMS → Centaur (projecten en blog) |
| Hosting | Vercel, domein steefan.nl |
| Repo | Deze repo, branch `redesign`. De Nuxt-code wordt vervangen en de geschiedenis blijft bewaard. |
| Referentie-implementatie | Steva's Kookboek (WaldJS + Centaur, Vercel-adapter, build-time fetch) |

## Sitemap

| NL | EN | Inhoud |
|---|---|---|
| `/` | `/en/` | Hero, bento met 3 uitgelichte projecten, horizontale rail "Ander werk", korte over-mij, laatste 3 blogposts, contact-CTA |
| `/werk` | `/en/work` | Alle projecten, filterbaar op type (framework / product / website / school) |
| `/werk/[slug]` | `/en/work/[slug]` | Case study: intro, gepinde sectie Probleem → Aanpak → Resultaat, stack, galerij, links (live, GitHub, npm) |
| `/blog` | `/en/blog` | Overzicht van posts |
| `/blog/[slug]` | `/en/blog/[slug]` | Blogpost |
| `/over` | `/en/about` | Over mij, skills/stack, cv-tijdlijn, cv-pdf-download, GitHub-activiteit |
| `/contact` | `/en/contact` | Contactformulier (Centaur Forms) en links |
| `/404` | | 404-pagina |

Daarnaast `sitemap.xml` (met hreflang-alternates) en `robots.txt`, gegenereerd in `wald.config.ts` zoals bij Steva's Kookboek.

De typefilter op `/werk` is client-side filtering (knoppen met `aria-pressed`) bovenop de volledige, statisch gerenderde lijst. Zonder JavaScript zijn de knoppen verborgen en is de volledige lijst zichtbaar.

## Content-model (Centaur)

Elke collectie-entry heeft:

- `locale`: `nl` of `en`
- `translationKey`: een stabiele sleutel die vertalingen van hetzelfde item koppelt (bijv. `waldjs`)

Per taal bestaat één entry. Dit sluit aan op een latere native locale-feature in Centaur: de migratie is dan het verplaatsen van `locale` naar het entry-niveau.

### Collectie `projecten`

| Veld | Type | Opmerking |
|---|---|---|
| `title` | tekst | |
| `slug` | tekst | per taal, mag verschillen |
| `summary` | tekst | 1–2 zinnen voor kaarten |
| `type` | enum | `framework`, `product`, `website`, `school` |
| `featured` | bool | uitgelicht in de bento op home |
| `order` | getal | sortering binnen featured en de rail |
| `year` | getal | |
| `client` | tekst | optioneel |
| `stack` | lijst tekst | |
| `cover` | media | |
| `problem` | richtext | case study |
| `approach` | richtext | case study |
| `result` | richtext | case study |
| `gallery` | lijst media | optioneel |
| `liveUrl` | url | optioneel |
| `repoUrl` | url | optioneel |
| `npmPackage` | tekst | optioneel, bijv. `@waldjs/cli` |

### Collectie `blog`

`title`, `slug`, `excerpt`, `body` (richtext), `cover` (media, optioneel), `publishedAt` (datum), `tags` (lijst tekst).

### Collectie `ervaring`

`role`, `organisation`, `start` (datum), `end` (datum, leeg = heden), `description` (richtext), `kind` (`werk` of `opleiding`).

### Collectie `skills`

`name`, `category` (bijv. `frontend`, `backend`, `design`, `tools`), `order`.

### Pagina's en site settings

- Pagina's `home`, `over` en `contact` (met het bestaande `locale`-veld van Centaur-pagina's) voor intro-teksten en SEO.
- Site settings: socials, cv-pdf (per taal), standaard-SEO, OG-afbeelding.

## Architectuur

```
src/
  lib/
    cms.ts          Centaur-API: getPage, getSiteSettings, getCollection
    content.ts      getProjects(locale), getProject(slug, locale), getPosts(locale),
                    getPost(slug, locale), getExperience(locale), getSkills(locale),
                    getTranslation(collection, translationKey, locale)
    i18n.ts         t(key, locale), localePath(route, locale), alternates(), UI-woordenlijst NL/EN
    github.ts       repos en recente activiteit van Stefan-Espant, tijdens de build
  layouts/
    Layout.wald     head, SEO, hreflang, JSON-LD (Person), design tokens, stenen
                    achtergrond, nav, taalwissel, footer, scripts
  components/
    Hero, Bento, ProjectRail, ProjectCard, ProjectGrid, CaseStudy, PostList,
    PostView, Timeline, SkillGrid, GithubActivity, ContactForm, LangSwitch, Nav, Footer
    pages/          HomePage, WorkPage, ProjectPage, BlogIndexPage, BlogPostPage,
                    AboutPage, ContactPage — elk met een `locale`-prop
  pages/
    index.wald, werk/index.wald, werk/[slug].wald, blog/index.wald,
    blog/[slug].wald, over.wald, contact.wald, 404.wald
    en/index.wald, en/work/…, en/blog/…, en/about.wald, en/contact.wald
  assets/
    js/motion.js    alle GSAP-effecten
    js/contact.js   progressief verbeterde formulier-submit
    fonts/          Fraunces en JetBrains Mono (self-hosted, woff2)
    stone/          bestaande responsive stenen webp's
  styles/
    tokens.css, base.css, components/*.css
scripts/
  migrate-datocms.ts   eenmalige migratie DatoCMS → Centaur
wald.config.ts         .env laden, Vercel-adapter, sitemap.xml, robots.txt, 404.html
```

### Principes

- **Eén pagina-component, twee routes.** De bestanden in `pages/` en `pages/en/` zijn dunne wrappers die hetzelfde pagina-component met een andere `locale` renderen.
- **Alle data tijdens de build.** De bezoeker krijgt statische HTML. Secrets (`CENTAUR_API_KEY`, `GITHUB_TOKEN`) worden alleen tijdens de build gebruikt en komen nooit in de output terecht.
- **JavaScript is enhancement.** Zonder JavaScript is alle content zichtbaar en werkt de navigatie. Alleen de animaties, de projectfilter en de asynchrone formulier-submit vragen JavaScript.
- **Rebuild bij content-wijziging:** een Centaur-webhook roept een Vercel Deploy Hook aan.

## Visueel systeem

### Kleur

| Token | Waarde | Gebruik |
|---|---|---|
| `--bg` | `#0b0d12` | pagina-achtergrond |
| `--surface` | `rgba(21,25,36,.72)` + `backdrop-filter: blur(6px)` | kaarten |
| `--border` | `#2a3245` | randen van kaarten |
| `--text` | `#e8eaf0` | tekst |
| `--text-muted` | `#9aa1b2` | secundaire tekst, navigatie |
| `--accent` | `#4d7cff` | links, focus, hover-randen |
| `--accent-2` | `#9b6bff` | eindkleur van het highlight-verloop |
| `--brand` | `#0f40ec` | pagina-wipe, `::selection`, vlakken |

Alle combinaties van tekst en achtergrond halen minimaal WCAG AA (4,5:1 voor broodtekst).

### Stenen achtergrond

De bestaande responsive stenen webp's, `position: fixed` achter de content. Filter: `grayscale(1) brightness(.55) contrast(1.4)`, `mix-blend-mode: luminosity`, dekking 35%. Tekst staat altijd op `--bg` of op een kaart met `--surface`, nooit direct op een licht deel van de steen.

### Typografie

- **Fraunces** (variabel, assen `opsz` 9–144, `wght`, `SOFT`) voor koppen en broodtekst. Koppen op `opsz` 144, broodtekst op de automatische optical size.
- **JetBrains Mono** voor navigatie, labels, metadata, code en tags.
- **Germania One** (breukletter, ook gebruikt op het vorige portfolio) als subtiel Zuid-Duits accent, via token `--font-display` en class `.display`. Alleen voor:
  - het logo "Steefan" (nav, footer, 404);
  - sectiekopjes (bijv. "Uitgelicht werk", "Blog");
  - projectnamen op kaarten, in de bento en in de rail.

  Nooit voor de grote koppen (h1), lopende tekst, navigatielinks of knoppen. Kleur: het blauw-paarse verloop (`--accent` → `--accent-2`) via `background-clip: text`. Onder `forced-colors: active` valt dat terug op de gewone tekstkleur. Geen andere alpenornamenten (geen ruiten, edelweiss of kaders).
- Vloeiende typeschaal met `clamp()`. Alle fonts worden zelf gehost als woff2 met `font-display: swap` en een preload voor Fraunces.

### Ruimte en vorm

Ruimte op een 4px-basis, radius 8px (kaarten) en 12px (grote panelen). Bento-grid: 12 kolommen op desktop, 6 op tablet, 1 op mobiel. Er is geen light mode in deze versie.

## Motion

Alle GSAP-code staat in `assets/js/motion.js`. Elementen kiezen een effect via `data-motion="<naam>"`. GSAP en ScrollTrigger worden met `defer` vanaf cdnjs geladen (versie 3.12.5), zoals op de WaldJS-marketingsite.

| Effect | Element | Gedrag |
|---|---|---|
| `parallax` | stenen achtergrond | verschuift rustig mee bij het scrollen (scrub) |
| `hero` | home-hero | kop en lead faden in (stagger), daarna bouwen de bento-kaarten op met `back.out` |
| `reveal` | secties en lijsten | 30px omhoog met fade, trigger op 85% van de viewport |
| `magnetic` | bento-kaarten, CTA's | volgen de muis, terugveren met `elastic.out`; alleen bij `(pointer: fine)` |
| `rail` | "Ander werk" op home | gepinde horizontale scroll (scrub) vanaf 768px; daaronder native horizontale swipe met scroll-snap |
| `pinCase` | case study | Probleem → Aanpak → Resultaat als gepinde panelen (scrub) |
| `transition` | interne links | blauwe wipe (`--brand`) bij navigatie; daarnaast CSS cross-document View Transitions |
| `fraunces` | koppen bij hover | subtiele animatie van de `wght`/`SOFT`-assen |

**Reduced motion:** bij `prefers-reduced-motion: reduce` stopt `motion.js` direct en blijft alle content statisch en zichtbaar. Ook View Transitions staan dan uit. Elementen worden nooit met CSS verborgen in afwachting van JavaScript. GSAP gebruikt `gsap.from` met `clearProps`.

## Toegankelijkheid (WCAG 2.2 AA)

- Landmarks (`header`, `nav`, `main`, `footer`), skip-link, logische koppenstructuur, één `h1` per pagina.
- `lang` per pagina en `hreflang`-alternates in de head.
- Zichtbare focus-ring in `--accent` op alle interactieve elementen.
- Rail: in DOM-volgorde met het toetsenbord bereikbaar en de kaarten zijn focusbaar. Pinning is alleen enhancement.
- Taalwissel: linkt naar de vertaling van de huidige pagina via `translationKey`. Ontbreekt die, dan linkt hij naar de home van de andere taal.
- Contactformulier: labels, foutmeldingen in een `aria-live`-regio en zonder JavaScript een gewone POST-fallback naar Centaur Forms.
- Afbeeldingen: `alt` uit Centaur-media. Decoratieve steen met `alt=""`.

## Foutafhandeling

| Situatie | Gedrag |
|---|---|
| Centaur onbereikbaar of 5xx tijdens de build | Build faalt met een duidelijke melding en de vorige deploy blijft live |
| Centaur-entry mist verplichte velden | Entry wordt overgeslagen met een waarschuwing in de build-log |
| Entry zonder vertaling | Verschijnt alleen in de eigen taal, met een waarschuwing in de build-log |
| GitHub-API faalt of rate limit | Waarschuwing in de build-log, GitHub-sectie wordt niet gerenderd |
| Formulier-submit faalt | Foutmelding in de `aria-live`-regio, ingevulde waarden blijven staan |

## Migratie

`scripts/migrate-datocms.ts` draait eenmalig lokaal:

1. Leest `allProjects` uit het portfolio-DatoCMS-project (`DATO_CMS_TOKEN`) en de blogposts uit het DatoCMS-project van de i-love-web-app (een eigen read-token, `DATO_BLOG_TOKEN`).
2. Uploadt afbeeldingen naar de Centaur-mediabibliotheek.
3. Maakt entries aan in `projecten` en `blog` met `locale: nl`, een `translationKey` afgeleid van de slug, en status `draft`.
4. Is idempotent: bestaande `translationKey`'s worden overgeslagen.

Stefan reviewt de drafts in Centaur en publiceert wat blijft. De content voor WaldJS, Centaur CMS en Steva's Kookboek en de Engelse vertalingen worden apart geschreven. DatoCMS wordt pas uitgezet na de livegang.

## Testen

- **Vitest** voor `src/lib/`: locale-filtering, vertaal-koppeling via `translationKey`, `localePath` en `alternates`, mapping van Centaur-data naar view-modellen, en de transformaties in het migratiescript.
- **`wald check`** voor de types in `.wald`- en `.ts`-bestanden.
- **Handmatige audit** op `wald preview`: Lighthouse ≥ 95 op Performance, Accessibility, Best Practices en SEO voor home, case study en blogpost. axe zonder fouten. Toetsenbord-doorloop van alle pagina's. Controle met reduced motion aan.

## Fasering

1. **Content:** collecties aanmaken in Centaur, migratiescript schrijven en draaien, NL-content voor de drie uitgelichte projecten.
2. **Basis:** WaldJS-project op `redesign`, tokens, fonts, layout, stenen achtergrond, nav, i18n.
3. **Pagina's:** home, werk en case study, blog, over, contact (eerst NL, daarna de EN-routes).
4. **Motion:** `motion.js` met alle effecten.
5. **Lokaal afronden:** EN-vertalingen, toegankelijkheids- en performance-audit, review door Stefan.
6. **Publiceren** (pas na akkoord van Stefan): Vercel-project, domein steefan.nl, Deploy Hook plus Centaur-webhook, DatoCMS uitzetten.

## Buiten scope

- Native locale-ondersteuning in Centaur (een mogelijk later eigen project).
- Light mode.
- Reacties of andere interactie op blogposts.
- Analytics. Komt er later analytics bij, dan moet die AVG-proof zijn en een cookiebanner krijgen.
