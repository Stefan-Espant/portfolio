# Verbeterplan portfolio — Centaur CMS en Byzantium

**Datum:** 2026-11-15
**Branch:** `redesign`
**Basis:** [spec](superpowers/specs/2026-10-12-portfolio-redesign-design.md), plannen 1–3 (fundament, pagina's, motion) zijn uitgevoerd.

## Huidige stand (gemeten op `npm run dev`, http://localhost:7233)

Alle 15 routes geven `200`, maar de site is nog bijna leeg:

| Onderdeel | Stand | Gevolg op de site |
|---|---|---|
| `projecten` | 18 entries, **allemaal `draft`** | Home en `/werk`: "Hier verschijnen binnenkort de projecten" |
| `blog` | 0 entries (migratie van DatoCMS kwam niet door) | Blog leeg, ook geen blogstrook op de home |
| `ervaring`, `skills` | 0 entries | Op `/over` geen tijdlijn en geen skills |
| `status`, `klanten` | 0 entries | Geen beschikbaarheidsstip, geen klantenrij |
| Site settings | `siteName` = "Mijn website" (standaardwaarde) | Subpagina's heten "Werk — Mijn website" |
| `GITHUB_TOKEN` | GitHub geeft `401` | Sectie GitHub-activiteit wordt overgeslagen |

Projectdrafts in detail:

- **Uitgelicht en compleet** (NL + EN, cover, case study): `waldjs`, `centaur-cms`, `stevas-kookboek`.
- **Alleen NL, alleen een cover, geen case study**: `grande-archee`, `paradiso-poster`, `examenproject`, `mohlen-vof`, `not-a-buzz-event`, `alweer`, `blue-tickets`, `peukenzee`, `nedfab-website`, `infraroad-navigatie-webapp`, `eva-s-kookboek`, `houtcreaties-scheeps-en-timmerwerken`.
- `eva-s-kookboek` lijkt een oudere dubbel van `stevas-kookboek`. Kiezen: samenvoegen of verwijderen.

## Deel A — Centaur CMS vullen

Dit is het meeste werk en levert direct het meeste op.

1. **Snelle fixes in Centaur**
   - Site settings: `siteName` = "Steefan", plus `tagline`, `metaDescription`, `linkedIn`, `instagram` en `defaultOgImageUrl`.
   - Nieuw GitHub-token (fine-grained, alleen lezen van publieke repo's) in `.env`.
2. **Publiceren**: eerst de drie uitgelichte projecten (NL + EN). Daarna is de bento op de home te beoordelen.
3. **Overige projecten**: per project bepalen of het blijft. Wat blijft krijgt `summary`, `type`, `year`, `stack`, `order` en een EN-vertaling. Een case study (`problem` / `approach` / `result`) alleen voor de 2–3 sterkste.
4. **Blog**: de migratie opnieuw draaien (`npm run migrate`, controleer `DATO_BLOG_TOKEN`) of 2–3 nieuwe posts schrijven, bijvoorbeeld over het bouwen van WaldJS en Centaur.
5. **Ervaring en skills**: HvA FDND (`opleiding`), werkervaring, en skills per categorie.
6. **Status en klanten**: één `status`-entry per taal en 3–5 klanten met logo, met minstens één quote.
7. **Pagina's** `home`, `over` en `contact` in Centaur voor intro-teksten en SEO. De pagina `contact` moet gepubliceerd zijn, anders weigert Centaur Forms de inzendingen.
8. **Preview-check**: `npm run build:preview` laat concepten zien voordat je ze publiceert.

**Klaar als:** geen enkele pagina een lege toestand toont, en de NL- en EN-versie voor elk gepubliceerd item bestaan.

## Deel B — Nieuw ontwerp en Byzantium (gedaan)

Besloten en gebouwd op 15–16 november 2026; zie [de spec](superpowers/specs/2026-11-15-portfolio-restyle-design.md) en [docs/byzantium.md](byzantium.md).

- Licht en donker thema, ijsblauw met een stilstaande blauwe gloed, diep blauw verloop als accent.
- Bricolage Grotesque voor koppen, Inter voor tekst, scherpe Fraunces voor accenten, blogs en de tijdlijn.
- Byzantium (MIT) als basislaag: tokens, reset, focus en View Transitions, met een eigen thema "Steefan". Vue-componenten worden niet gebruikt.
- Animaties op niveau 2; de lichtbundel, de steen, de wipe en Germania One zijn verdwenen.

## Deel C — Openstaand uit de spec

Nog niet gebouwd (plan 4 en 5):

- Plan 4: build-strip, social-afbeeldingen (satori), RSS, commandopalet (⌘K) en de `.wald`-playground.
- Plan 5: README herschrijven (er staat nog de Nuxt-starter in), audits (Lighthouse ≥ 95, axe, toetsenbord, reduced motion), Vercel en steefan.nl, Deploy Hook en Centaur-webhook, DatoCMS uitzetten.

## Voorgestelde volgorde

1. Deel A, stap 1–2: site settings en de drie uitgelichte projecten publiceren. Lokaal kun je concepten al bekijken met `CENTAUR_PREVIEW=1 npm run dev`.
2. Deel A, stap 3–8: de rest van de content.
3. Plan 4 (extra's), met het commandopalet en de build-strip op Byzantium-tokens.
4. Plan 5: afronden en publiceren, na akkoord.

## Open vragen

- Welke van de 12 kleinere projecten blijven staan?
- `eva-s-kookboek`: samenvoegen met `stevas-kookboek` of verwijderen?
- Blog: oude posts migreren, of opnieuw beginnen met nieuwe posts?
