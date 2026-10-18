// Bakt de CSS-filters van de stenen achtergrond in de afbeelding zelf (spec: "Stenen achtergrond"):
// grayscale, brightness .55, contrast 1.4 en 35% dekking over #0b0d12. De browser hoeft dan niets
// meer te filteren. Gebruik: npm run stone
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'

const [src = 'assets-src/stone-1400.webp', outDir = 'public/images/stone'] = process.argv.slice(2)
const BG = [11, 13, 18]
const OPACITY = 0.35
mkdirSync(outDir, { recursive: true })

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
