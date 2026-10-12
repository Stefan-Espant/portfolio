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
