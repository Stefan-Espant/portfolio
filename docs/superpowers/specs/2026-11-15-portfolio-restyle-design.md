# Portfolio restyle — ontwerp

**Datum:** 2026-11-15
**Status:** goedgekeurd (prototype in `.superpowers/brainstorm/`, keuzes stap voor stap met live mockups)
**Branch:** `redesign`
**Vervangt:** de onderdelen *Visueel systeem*, *Motion* en de visuele *Extra's* uit [2026-10-12-portfolio-redesign-design.md](2026-10-12-portfolio-redesign-design.md). Sitemap, content-model, architectuur, toegankelijkheid, foutafhandeling en migratie uit die spec blijven gelden.

## Doel

Het portfolio krijgt een lichte, strakke "award site"-stijl met Zwitserse invloeden, in plaats van het donkere thema met stenen achtergrond, saffraan en Germania One. De site blijft gebouwd met WaldJS en Centaur CMS. Het Byzantium design system wordt de basislaag voor tokens, reset en focus.

## Beslissingen

| Onderwerp | Keuze |
|---|---|
| Richting | Bento met ronde kaarten (richting "C — Zacht Zwitsers") |
| Thema's | Licht (standaard) en donker. Volgt de systeeminstelling; een knop wisselt en onthoudt de keuze |
| Achtergrond | Licht: ijsblauw `#f3f5ff`. Donker: `#0f0f12`. Beide met een stilstaande, zachte blauwe gloed (rechtsboven en linksonder), zonder textuur |
| Kaarten | Licht: wit met een heel lichte schaduw. Donker: `#1b1b20`. Radius 18px, pillen 99px |
| Accent | Diep blauw, toon-op-toon verloop. Licht: `#1b22c9 → #3046ff → #3a63f0`. Donker: `#6f7bff → #8fa0ff → #a9c4ff` |
| Koppen | Bricolage Grotesque, gewicht 600, breedte 85 |
| Tekst en interface | Inter |
| Serif | Fraunces in scherpe instelling (`opsz` 144, `SOFT` 0, `WONK` 0): cursief voor accentwoorden in koppen, en voor de lopende tekst van blogposts en de tijdlijn op case studies |
| Code | Monospace van het systeem (`ui-monospace`) |
| Animatie | Niveau 2 (zie Motion) |
| Teksten | Zakelijk en feitelijk, gebaseerd op de content in Centaur. Geen verzonnen klanten, quotes of cijfers |
| Design system | Byzantium (MIT) als basislaag, met een eigen thema "Steefan" in de `--byz-*`-tokens |

Alle combinaties van tekst en achtergrond halen WCAG AA. De laagste waarde is 4,4:1 (eindkleur van het verloop als grote koptekst op ijsblauw, waar 3:1 volstaat). Witte tekst op elk kleurpunt van het verloop haalt minstens 4,97:1.

## Byzantium

Byzantium is een Vue-bibliotheek; WaldJS gebruikt geen Vue. Daarom worden alleen de framework-onafhankelijke stijlen opgenomen, zoals in Clevorio:

| Bron (`packages/byzantium/src/styles/`) | Doel |
|---|---|
| `base/_root.scss` | `src/styles/byzantium/root.css` |
| `base/_reset.scss` | `src/styles/byzantium/reset.css` |
| `utilities/_focus.scss` | `src/styles/byzantium/focus.css` |
| `utilities/_sr-only.scss` | `src/styles/byzantium/sr-only.css` |
| `utilities/_view-transitions.scss` | `src/styles/byzantium/view-transitions.css` |
| `LICENSE` | `public/licenses/byzantium.txt` |

- Gepinde commit: `95d6972854f2b0b7b8067cd26db94b5fd6102310`. `scripts/vendor-byzantium.mjs <pad-naar-checkout>` zet de SCSS om naar CSS (alleen `//`-commentaar verwijderen; de bestanden gebruiken geen andere Sass-syntax) en schrijft een kop met bron en commit. De gevendorde bestanden blijven ongewijzigd; aanpassingen gebeuren in `tokens.css`.
- `tokens.css` definieert het thema "Steefan": de `--byz-*`-kleuren, fonts, schaduwen en duur voor licht (`:root`, `[data-theme="light"]`) en donker (`[data-theme="dark"]`). Daarna volgen korte site-aliassen (`--bg`, `--card`, `--ink`, `--muted`, `--accent`, `--grad`, …) die naar de `--byz-*`-tokens verwijzen. Componenten gebruiken de aliassen.
- Byzantium-componenten (Vue), iconen en fonts worden niet opgenomen. `docs/byzantium.md` legt bron, rechten en de updateprocedure vast.

## Componenten

| Onderdeel | Ontwerp |
|---|---|
| Nav | Logo "Steefan" (Bricolage 700), pilnavigatie met glijdende indicator, taalwissel als pil, themaknop (☾/☀; verborgen zonder JavaScript) |
| Hero (home) | Beschikbaarheid, kop met cursief accent, intro. Kop: "Snelle, toegankelijke websites, *van framework tot frontend.*" |
| Bento (home) | Grote kaart (eerste uitgelichte project), twee kaarten, verlooptegel "0 KB framework-JavaScript per pagina", notitietegel "Open source op npm … `npm create wald`" |
| Projectkaart | Witte kaart met cover, titel (Bricolage) en soort; bij hover zoomt de cover en verschijnt een pijl |
| Marquee | Projectnamen; elke tweede naam in Fraunces cursief met het verloop |
| Eerder werk | Gepinde horizontale strook met teller en verloopbalk; op mobiel en bij reduced motion een swipe-lijst |
| Over (home) | Twee kaarten: korte tekst met link, en de gebruikte technieken (uit Centaur-skills, anders uit de stacks van de projecten) |
| Blog (home) | De drie nieuwste posts als kaarten; zonder cover een abstracte verloopafbeelding |
| CTA | Donkere kaart met beschikbaarheid, kop "Heb je een project *in gedachten?*" en knop |
| Case study | Kruimelpad, grote titel, samenvatting in Fraunces, feitenrij (soort, jaar, stack, links), brede cover, cijfers als kaarten, tijdlijn met verloop, volgend project |
| Blogpost | Kop met byline, cover, lopende tekst in Fraunces (20px, regelafstand 1,7, maximaal 880px), tussenkoppen in Bricolage, initiaal met verloop, citaat met verlooprand, codeblok |
| Over | Intro-kaart met portret, ervaring als tijdlijnlijst, skills in kaarten per categorie, GitHub-repo's |
| Contact | Kop "Laten we iets *bouwen.*", formulier in een kaart (Centaur Forms), zijkaarten met e-mail en kanalen |
| Footer | Woordmerk, korte regel, kolommen met pagina's en externe links |

Accentwoorden in vertaalteksten staan tussen sterretjes (`'Eerder *werk*'`); de helper `accent()` in `i18n.ts` escapet de tekst en maakt van `*…*` een `<em>`.

## Motion

GSAP 3 + ScrollTrigger + SplitText blijven (uit `node_modules`, via `public/vendor/`). Elk effect staat in een eigen module en draait in een `try/catch`.

| Effect | Gedrag |
|---|---|
| `intro` | Kopregels schuiven uit een masker omhoog (SplitText `lines` + `mask`); daarna faden beschikbaarheid en intro in; bento-kaarten schalen in (0,94 → 1) en de covers zoomen uit (1,35 → 1) |
| `reveal` | Sectiekoppen per regel uit een masker bij in beeld komen; kaarten in grids bouwen op (`ScrollTrigger.batch`) |
| `hover` | Cover-zoom (1,06) en pijl bij hover op projectkaarten (alleen `pointer: fine`) |
| `nav` | Indicator glijdt naar de link onder de muis en terug naar de huidige pagina |
| `marquee` | Ongewijzigd: snelheid volgt het scrollen, draait om bij omhoog, pauzeert buiten beeld |
| `hscroll`, `timeline` | Ongewijzigd gedrag, nieuwe stijl |
| `count` | Ongewijzigd (cijfers op case studies) |
| Pagina-overgang | Alleen CSS View Transitions (Byzantium-fade). Cover en titel van een project schuiven door van kaart naar case study (`view-transition-name` per slug) |

Vervallen: lichtbundel, steen-parallax, donkere wipe, letter-voor-letter koppen, 3D-tilt en lichtvlek.

Performance-regels blijven: alleen `transform` en `opacity` animeren, `quickTo` voor muis-effecten, geen `backdrop-filter` of filters op grote vlakken (de gloed is een vaste laag), doorlopende animaties pauzeren buiten beeld. Bij `prefers-reduced-motion` start geen enkel effect, staan View Transitions uit en is de tijdlijn volledig actief. Zonder JavaScript is alle inhoud zichtbaar; alleen de home-intro wacht maximaal 3 seconden op het motion-script.

## Opruimen

Vervallen en verwijderd: `scripts/bake-stone.mjs` en het npm-script `stone`, `public/images/stone/`, de fonts JetBrains Mono en Germania One, `public/motion/ambient.js` en `public/motion/transition.js`.

## Testen

- Vitest: bestaande tests blijven groen; nieuwe tests voor `accent()`.
- `wald check` zonder fouten.
- Visuele controle met screenshots van alle pagina's in licht en donker, desktop en mobiel, en met reduced motion.
- Toetsenbord: focus zichtbaar, themaknop en filter bedienbaar.
