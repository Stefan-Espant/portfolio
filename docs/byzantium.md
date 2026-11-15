# Byzantium in het portfolio

Het portfolio gebruikt het Byzantium design system als basislaag voor tokens, reset en focus. Byzantium is een Vue-bibliotheek en WaldJS gebruikt geen Vue. Daarom zijn alleen de framework-onafhankelijke stijlen opgenomen, als CSS.

## Bron en rechten

- Repository: `https://github.com/Byzantium-design-system/Byzantium-design-system`
- Gepinde commit: `95d6972854f2b0b7b8067cd26db94b5fd6102310`
- Licentie: MIT, © 2026 Stefan van der Kort. De ongewijzigde licentietekst staat in `public/licenses/byzantium.txt` en is op de site te vinden via `/licenses/byzantium.txt` (gelinkt in de footer).

## Opgenomen bestanden

| Bron (`packages/byzantium/src/styles/`) | Doel |
|---|---|
| `base/_root.scss` | `src/styles/byzantium/root.css` |
| `base/_reset.scss` | `src/styles/byzantium/reset.css` |
| `utilities/_focus.scss` | `src/styles/byzantium/focus.css` |
| `utilities/_sr-only.scss` | `src/styles/byzantium/sr-only.css` |
| `utilities/_view-transitions.scss` | `src/styles/byzantium/view-transitions.css` |

De bestanden gebruiken geen Sass-syntax, op `//`-commentaar na. Het script verwijdert dat commentaar en schrijft een kop met bron en commit. Verder blijven de bestanden ongewijzigd. Vue-componenten, iconen, fonts en andere assets uit Byzantium zijn niet opgenomen.

## Thema "Steefan"

`src/styles/tokens.css` overschrijft de `--byz-*`-tokens met de eigen kleuren, fonts en schaduwen: licht onder `:root` en `[data-theme='light']`, donker onder `[data-theme='dark']`. Daaronder staan korte aliassen (`--bg`, `--card`, `--ink`, `--accent`, `--grad`, …) die de componenten gebruiken. `Layout.wald` laadt eerst de Byzantium-bestanden en daarna `tokens.css` en `base.css`, zodat de eigen waarden winnen.

Pas dus nooit de bestanden in `src/styles/byzantium/` aan; wijzigingen horen in `tokens.css` of `base.css`.

## Bijwerken

1. Haal de nieuwe Byzantium-versie op in een lokale checkout en controleer licentie en wijzigingen.
2. Draai `node scripts/vendor-byzantium.mjs <pad-naar-checkout>`. Het script stopt als een bestand Sass-syntax bevat die niet automatisch om te zetten is.
3. Werk de commit hierboven bij en draai `npm test`, `npm run check` en een visuele controle in licht en donker.
