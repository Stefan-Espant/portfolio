import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { parseEnv } from 'node:util'
import { defineConfig, vercelAdapter } from '@waldjs/cli'

// GSAP met ScrollTrigger en SplitText als losse bestanden naast de site (public/vendor staat in
// .gitignore): de browser cachet ze en ze laden alleen met defer.
const gsapDist = join(dirname(createRequire(join(process.cwd(), 'package.json')).resolve('gsap/package.json')), 'dist')
mkdirSync('public/vendor', { recursive: true })
for (const file of ['gsap.min.js', 'ScrollTrigger.min.js', 'SplitText.min.js']) {
  copyFileSync(join(gsapDist, file), join('public/vendor', file))
}

// Lokaal staan de Centaur- en GitHub-gegevens in .env; op Vercel komen ze uit de project-env
// vars (die winnen, vandaar ??=). BOM strippen: sommige editors zetten er een voor.
if (existsSync('.env')) {
  const env = parseEnv(readFileSync('.env', 'utf8').replace(/^\uFEFF/, ''))
  for (const [key, value] of Object.entries(env)) process.env[key] ??= value
}

export default defineConfig({
  adapter: vercelAdapter()
})
