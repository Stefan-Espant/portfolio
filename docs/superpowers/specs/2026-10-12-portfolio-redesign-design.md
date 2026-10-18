# Portfolio redesign — ontwerp

**Datum:** 2026-10-12
**Status:** goedgekeurd (herzien 2026-10-15: Germania One-accent; herzien 2026-10-18: saffraan, gebakken steen, zeven motion-effecten, extra's)
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
| Animatie | GSAP 3 (npm, ≥ 3.13 voor SplitText) + ScrollTrigger + SplitText: zeven effecten (zie Motion), met harde performance-regels |
| Visuele stijl | Donker developer-thema met bento-grid, de stenen textuur als vooraf donker gebakken achtergrond, en saffraan als accentkleur |
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
| `/` | `/en/` | Hero, bento met 3 uitgelichte projecten, marquee met projectnamen, klantenrij met quote, horizontale rail "Ander werk", korte over-mij, laatste 3 blogposts, contact-CTA met beschikbaarheid |
| `/werk` | `/en/work` | Alle projecten, filterbaar op type (framework / product / website / school) |
| `/werk/[slug]` | `/en/work/[slug]` | Case study: intro, cijfers (optellend), gepinde sectie Probleem → Aanpak → Resultaat, stack, galerij, links (live, GitHub, npm); bij WaldJS een live `.wald`-playground |
| `/blog` | `/en/blog` | Overzicht van posts |
| `/blog/[slug]` | `/en/blog/[slug]` | Blogpost |
| `/over` | `/en/about` | Over mij, skills/stack, cv-tijdlijn, cv-pdf-download, GitHub-activiteit |
| `/contact` | `/en/contact` | Contactformulier (Centaur Forms) en links |
| `/404` | | 404-pagina |

Daarnaast `sitemap.xml` (met hreflang-alternates), `robots.txt`, `/rss.xml` en `/en/rss.xml`, een social-afbeelding per pagina en een zoekindex voor het commandopalet, allemaal gegenereerd tijdens de build.

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
| `metrics` | tekst | optioneel; per regel `Label: waarde` (bijv. `Lighthouse: 100`), getallen tellen op op de case study |

De echte veldslugs in Centaur zijn snake_case (`live_url`, `npm_package`, `translation_key`); zie `docs/centaur-collecties.md`. Lijsten (`stack`, `tags`) zijn tekst met komma's.

### Collectie `blog`

`title`, `slug`, `excerpt`, `body` (richtext), `cover` (media, optioneel), `publishedAt` (datum), `tags` (lijst tekst).

### Collectie `ervaring`

`role`, `organisation`, `start` (datum), `end` (datum, leeg = heden), `description` (richtext), `kind` (`werk` of `opleiding`).

### Collectie `skills`

`name`, `category` (bijv. `frontend`, `backend`, `design`, `tools`), `order`.

### Collectie `status`

Eén entry per taal: `available` (bool) en `text` (bijv. "Beschikbaar voor opdrachten vanaf januari"). Voedt de beschikbaarheidsstip bij de contact-CTA. Zonder entry wordt de stip niet getoond.

### Collectie `klanten`

`name`, `logo` (media, optioneel: zonder logo toont de site de naam), `url`, `quote`, `quote_author`, `order`. Voedt de klantenrij met quote op de home.

### Collecties aanmaken

`docs/centaur-collecties.js` maakt alle collecties in één keer aan via de dashboard-sessie (plakken in de browserconsole), naar het voorbeeld van Steva's Kookboek.

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
| `--surface` | `rgba(21,25,36,.9)` | kaarten (geen `backdrop-filter`, zie Performance) |
| `--border` | `#2a3245` | randen van kaarten |
| `--text` | `#e8eaf0` | tekst |
| `--text-muted` | `#9aa1b2` | secundaire tekst, navigatie |
| `--accent` | `#ffb000` (saffraan) | links, focus, hover-randen, highlight, beginkleur van het verloop (10,6:1 op `--bg`) |
| `--accent-2` | `#f28c18` | eindkleur van het saffraan-verloop (7,9:1 op `--bg`) |
| `--brand` | `#161208` | donker vlak van de pagina-wipe, met een saffraan logo en een 2px saffraan lijn |
| `--selection-bg` / `--selection-text` | `#3a2a0a` / `#ffd27a` | `::selection` |

Het vroegere merkblauw komt niet meer terug. Alle combinaties van tekst en achtergrond halen minimaal WCAG AA (4,5:1 voor broodtekst).

### Stenen achtergrond

De stenen textuur wordt **vooraf donker gebakken** met sharp (`scripts/bake-stone.mjs`): grayscale, brightness .55, contrast 1.4 en 35% over `--bg`, als webp in 489, 857 en 1400 px breed (`public/images/stone/stone-dark-*.webp`). In de browser staat er geen CSS-filter of blend-mode op; de afbeelding staat `position: fixed` achter de content met `will-change: transform` voor de parallax. Tekst staat altijd op `--bg` of op een kaart met `--surface`, nooit direct op een licht deel van de steen.

### Typografie

- **Fraunces** (variabel, assen `opsz` 9–144, `wght`, `SOFT`) voor koppen en broodtekst. Koppen op `opsz` 144, broodtekst op de automatische optical size.
- **JetBrains Mono** voor navigatie, labels, metadata, code en tags.
- **Germania One** (breukletter, ook gebruikt op het vorige portfolio) als subtiel Zuid-Duits accent, via token `--font-display` en class `.display`. Alleen voor:
  - het logo "Steefan" (nav, footer, 404);
  - sectiekopjes (bijv. "Uitgelicht werk", "Blog");
  - projectnamen op kaarten, in de bento en in de rail.

  Nooit voor de grote koppen (h1), lopende tekst, navigatielinks of knoppen. Kleur: het saffraan-verloop (`--accent` → `--accent-2`) via `background-clip: text`. Onder `forced-colors: active` valt dat terug op de gewone tekstkleur. Geen andere alpenornamenten (geen ruiten, edelweiss of kaders).
- Vloeiende typeschaal met `clamp()`. Alle fonts worden zelf gehost als woff2 met `font-display: swap` en een preload voor Fraunces.

### Ruimte en vorm

Ruimte op een 4px-basis, radius 8px (kaarten) en 12px (grote panelen). Bento-grid: 12 kolommen op desktop, 6 op tablet, 1 op mobiel. Er is geen light mode in deze versie.

## Motion

Alle GSAP-code staat in `public/motion.js`. GSAP, ScrollTrigger en SplitText komen uit het npm-pakket `gsap` en worden door `wald.config.ts` naar `public/vendor/` gekopieerd (zoals bij Steva's Kookboek), en met `defer` geladen. Elementen kiezen een effect via `data-motion="<naam>"`.

| # | Effect | Element | Gedrag |
|---|---|---|---|
| 1 | `intro` | home-hero | kopregels schuiven uit een masker omhoog (SplitText, `mask: 'lines'`); Fraunces groeit van `wght` 300 naar 700; het logo-verloop veegt erdoorheen; de steen zoomt rustig in; lead en hint faden in |
| 2 | `torch` | hele pagina | een zachte lichtbundel (radial-gradient, 520px) volgt de muis via `gsap.quickTo` op `transform`; alleen bij `(pointer: fine)` |
| 3 | `chars` | sectiekopjes (`.display`) | letters verschijnen per letter uit een masker met `back.out`, bij 85% van de viewport |
| 4 | `bento` | bento-kaarten | bouwen op (y + rotateX + opacity, stagger); kantelen naar de muis (±10°) met `quickTo` en een saffraan lichtvlek onder de cursor; terugveren met `elastic.out`; tilt alleen bij `(pointer: fine)` |
| 5 | `marquee` | band met projectnamen | loopt continu; snelheid volgt de scrollsnelheid (één snelheids-tween, `overwrite: true`), draait om bij omhoog scrollen; gepauzeerd buiten beeld |
| 6 | `rail` | "Ander werk" | gepinde horizontale scroll met voortgangsbalk (scrub) vanaf 768px; daaronder native horizontale swipe met scroll-snap |
| 7 | `transition` | interne links | donkere wipe (`--brand`) met saffraan logo en lijn; daarnaast CSS cross-document View Transitions |

Daarnaast: `parallax` op de steen (scrub, `yPercent`), `count` voor cijfers op case studies (tellen op bij in beeld), en de gepinde case-study-sectie Probleem → Aanpak → Resultaat (`pinCase`).

### Performance-regels

Vastgesteld na een demo die zichtbaar haperde:

- Alleen `transform` en `opacity` animeren (plus de `wght`-as éénmalig in de intro). Geen animaties op `filter`, `mask`, `box-shadow`, `width/height` of `top/left`.
- Geen CSS-filters of `mix-blend-mode` op grote vlakken; de steen is vooraf gebakken.
- Geen `backdrop-filter`.
- Alles wat de muis volgt gebruikt `gsap.quickTo`; nooit een nieuwe tween per `pointermove`. Afmetingen worden bij `pointerenter` gemeten, niet bij elke beweging. Listeners zijn `passive`.
- Doorlopende animaties (marquee) pauzeren buiten beeld via ScrollTrigger `onToggle`.
- `ScrollTrigger.config({ ignoreMobileResize: true })`.
- Muis-effecten (torch, tilt) alleen bij `(pointer: fine)`.

**Reduced motion:** bij `prefers-reduced-motion: reduce` stopt `motion.js` direct en blijft alle content statisch en zichtbaar; de intro-kop staat dan direct op `wght` 700. Ook View Transitions en de pulserende beschikbaarheidsstip staan dan uit. Elementen worden nooit met CSS verborgen in afwachting van JavaScript. GSAP gebruikt `gsap.from` met `clearProps`.

## Extra's

| Onderdeel | Gedrag |
|---|---|
| Build-strip | Onderaan elke pagina: bouwtijd, HTML-gewicht van de pagina, framework-JS-gewicht en datum van de laatste content-update, gemeten door de build zelf (de adapter vult placeholders in de gebouwde HTML in). Een Lighthouse-score staat er alleen als die echt gemeten is in de audit. |
| Beschikbaarheid | Pil met (pulserende) saffraan stip boven de contact-CTA, uit collectie `status`. |
| Klantenrij | Namen of logo's plus één quote op de home, uit collectie `klanten`. |
| Cijfers | Op case studies, uit het veld `metrics`; getallen tellen op. |
| Social-afbeeldingen | Per pagina een PNG (1200×630) met de titel in Germania op de gebakken steen, gemaakt tijdens de build met satori + @resvg/resvg-js; `og:image` en `twitter:card` in de head. |
| RSS | `/rss.xml` (NL) en `/en/rss.xml` (EN) met de blogposts. |
| Commandopalet | ⌘K / Ctrl+K of een knop in de nav opent een `<dialog>` met een combobox (ARIA `combobox` + `listbox`, pijltjes, Enter, Esc) over pagina's, projecten, posts en de taalwissel; de lijst komt uit een zoekindex (JSON) die de build maakt. Zonder JavaScript: gewone navigatie, de knop is verborgen. |
| `.wald`-playground | Op de case study van WaldJS: links bewerkbare `.wald`-code, rechts het resultaat. Hergebruikt de `Playground` van de WaldJS-marketingsite; de uitwerking volgt in het plan. |

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

Alles wordt eerst lokaal afgemaakt; publiceren gebeurt pas na akkoord van Stefan.

1. **Fundament** (plan 1): WaldJS-project, libs, collecties, migratie, layout, eerste home. Inclusief een vervolg: saffraan-kleuren en de gebakken steen.
2. **Pagina's** (plan 2): werk-overzicht met filter, case study (met cijfers), blog, over (tijdlijn, skills, GitHub), contact (met Centaur Forms en beschikbaarheid), klantenrij en marquee op de home, plus alle EN-routes.
3. **Motion** (plan 3): `motion.js` met de zeven effecten, parallax, count en pinCase, volgens de performance-regels.
4. **Extra's** (plan 4): build-strip, social-afbeeldingen, RSS, commandopalet en de `.wald`-playground.
5. **Afronden en publiceren** (plan 5): EN-vertalingen, audits (Lighthouse, axe, toetsenbord, reduced motion), README, Vercel-project, steefan.nl, Deploy Hook en Centaur-webhook, DatoCMS uitzetten.

## Buiten scope

- Native locale-ondersteuning in Centaur (een mogelijk later eigen project).
- Light mode.
- Reacties of andere interactie op blogposts.
- Analytics. Komt er later analytics bij, dan moet die AVG-proof zijn en een cookiebanner krijgen.
