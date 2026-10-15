// Downloadt de Latijnse subsets van Fraunces (variabel: opsz, wght, SOFT), JetBrains Mono
// (variabel: wght) en Germania One van Google Fonts naar public/fonts/. Eenmalig draaien; alle drie OFL.
import { mkdirSync, writeFileSync } from 'node:fs'

// Google Fonts geeft alleen woff2 aan een moderne browser-UA.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
const FONTS = [
  ['fraunces-latin.woff2', 'Fraunces:opsz,wght,SOFT@9..144,300..800,0..100'],
  ['jetbrains-mono-latin.woff2', 'JetBrains+Mono:wght@400..700'],
  ['germania-one-latin.woff2', 'Germania+One']
]

mkdirSync('public/fonts', { recursive: true })
for (const [file, family] of FONTS) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}&display=swap`, { headers: { 'User-Agent': UA } })).text()
  const url = css.split('/* latin */')[1]?.match(/url\((https:[^)]+\.woff2)\)/)?.[1]
  if (!url) throw new Error(`Geen latin-woff2 gevonden voor ${family}`)
  writeFileSync(`public/fonts/${file}`, Buffer.from(await (await fetch(url)).arrayBuffer()))
  console.log(`✓ public/fonts/${file}`)
}
