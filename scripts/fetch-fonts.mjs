// Downloadt de Latijnse subsets van Bricolage Grotesque (variabel: opsz, wdth, wght), Inter (wght) en
// Fraunces rechtop en cursief (opsz, wght, SOFT, WONK) van Google Fonts naar public/fonts/.
// Daarnaast vaste TTF-versies voor de social-afbeeldingen (satori leest geen woff2 of variabele assen)
// naar src/build/fonts/; die gaan niet mee naar de site. Eenmalig draaien (npm run fonts); alle drie OFL.
import { mkdirSync, writeFileSync } from 'node:fs'

// Google Fonts geeft alleen woff2 aan een moderne browser-UA.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
const FONTS = [
  ['bricolage-grotesque-latin.woff2', 'Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..700'],
  ['inter-latin.woff2', 'Inter:wght@400..700'],
  ['fraunces-latin.woff2', 'Fraunces:opsz,wght,SOFT,WONK@9..144,300..700,0..100,0..1'],
  ['fraunces-italic-latin.woff2', 'Fraunces:ital,opsz,wght,SOFT,WONK@1,9..144,300..700,0..100,0..1']
]

mkdirSync('public/fonts', { recursive: true })
for (const [file, family] of FONTS) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}&display=swap`, { headers: { 'User-Agent': UA } })).text()
  const url = css.split('/* latin */')[1]?.match(/url\((https:[^)]+\.woff2)\)/)?.[1]
  if (!url) throw new Error(`Geen latin-woff2 gevonden voor ${family}`)
  writeFileSync(`public/fonts/${file}`, Buffer.from(await (await fetch(url)).arrayBuffer()))
  console.log(`✓ public/fonts/${file}`)
}

// Social-afbeeldingen: zonder browser-UA geeft Google Fonts TTF; met vaste assen een statische versie.
const OG_FONTS = [
  ['bricolage-grotesque-600.ttf', 'Bricolage+Grotesque:opsz,wdth,wght@96,87.5,600'],
  ['inter-500.ttf', 'Inter:wght@500'],
  ['fraunces-italic-400.ttf', 'Fraunces:ital,opsz,wght,SOFT,WONK@1,144,400,0,0']
]
mkdirSync('src/build/fonts', { recursive: true })
for (const [file, family] of OG_FONTS) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}`)).text()
  const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1]
  if (!url) throw new Error(`Geen TTF gevonden voor ${family}`)
  writeFileSync(`src/build/fonts/${file}`, Buffer.from(await (await fetch(url)).arrayBuffer()))
  console.log(`✓ src/build/fonts/${file}`)
}
