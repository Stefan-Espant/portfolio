// Neemt de framework-onafhankelijke basisstijlen van het Byzantium design system (MIT) over als CSS.
// Gebruik: node scripts/vendor-byzantium.mjs <pad-naar-Byzantium-checkout>
// De bestanden gebruiken geen Sass-syntax behalve //-commentaar; dat wordt verwijderd. Verder blijven ze
// ongewijzigd: het eigen thema staat in src/styles/tokens.css. Zie docs/byzantium.md.
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const source = process.argv[2]
if (!source) {
  console.error('Gebruik: node scripts/vendor-byzantium.mjs <pad-naar-Byzantium-checkout>')
  process.exit(1)
}

const commit = execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
const FILES = [
  ['base/_root.scss', 'root.css'],
  ['base/_reset.scss', 'reset.css'],
  ['utilities/_focus.scss', 'focus.css'],
  ['utilities/_sr-only.scss', 'sr-only.css'],
  ['utilities/_view-transitions.scss', 'view-transitions.css']
]

/** //-commentaar weghalen, maar niet binnen strings of url(...) (die komen in deze bestanden niet voor). */
function stripLineComments(scss) {
  return scss.split('\n').map(line => line.replace(/(^|\s)\/\/.*$/, '').trimEnd()).join('\n').replace(/\n{3,}/g, '\n\n')
}

mkdirSync('src/styles/byzantium', { recursive: true })
for (const [from, to] of FILES) {
  const scss = readFileSync(join(source, 'packages/byzantium/src/styles', from), 'utf8')
  if (/@(use|import|mixin|include|function)|\$[a-z]/i.test(scss)) throw new Error(`${from} bevat Sass-syntax; omzetten met de hand controleren`)
  const header = `/* Byzantium design system (MIT, © 2026 Stefan van der Kort): ${from}\n   Bron-commit ${commit}. Niet bewerken; bijwerken via scripts/vendor-byzantium.mjs. */\n`
  writeFileSync(`src/styles/byzantium/${to}`, header + stripLineComments(scss).trim() + '\n')
  console.log(`✓ src/styles/byzantium/${to}`)
}
mkdirSync('public/licenses', { recursive: true })
copyFileSync(join(source, 'LICENSE'), 'public/licenses/byzantium.txt')
console.log('✓ public/licenses/byzantium.txt')
