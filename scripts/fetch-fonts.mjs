// Downloadt de Latijnse subsets van Bricolage Grotesque (variabel: opsz, wdth, wght), Inter (wght) en
// Fraunces rechtop en cursief (opsz, wght, SOFT, WONK) van Google Fonts naar public/fonts/.
// Eenmalig draaien (npm run fonts); alle drie OFL.
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
