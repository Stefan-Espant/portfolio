import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { parseEnv } from 'node:util'
import { defineAdapter, defineConfig, vercelAdapter } from '@waldjs/cli'
import { writeExtras } from './src/build/extras'

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

// Cache-headers als echte routes in .vercel/output/config.json. De adapter zet ze onder `overrides`, maar
// de Build Output API kent daar geen headers: Vercel stuurde overal max-age=0. Gehashte bestanden in
// /assets mogen een jaar; fonts, GSAP en afbeeldingen hebben vaste namen (inhoud kan wijzigen), dus een week
// met stale-while-revalidate. `continue: true` laat de filesystem-route daarna het bestand serveren.
const CACHE_ROUTES = [
  { src: '^/assets/(.*)$', headers: { 'cache-control': 'public, max-age=31536000, immutable' }, continue: true },
  { src: '^/(fonts|vendor|images)/(.*)$', headers: { 'cache-control': 'public, max-age=604800, stale-while-revalidate=86400' }, continue: true }
]
function addCacheRoutes(staticDir: string) {
  const file = join(dirname(staticDir), 'config.json')
  const config = JSON.parse(readFileSync(file, 'utf8')) as { routes?: unknown[] }
  config.routes = [...CACHE_ROUTES, ...(config.routes ?? [])]
  writeFileSync(file, JSON.stringify(config, null, 2))
}

// De Vercel-adapter, met eerst de extra's (RSS, build-strip, social-afbeeldingen) op de gebouwde output.
const vercel = vercelAdapter()
export default defineConfig({
  adapter: defineAdapter({
    name: vercel.name,
    outDir: vercel.outDir,
    async adapt(context) {
      await writeExtras(context)
      await vercel.adapt?.(context)
      addCacheRoutes(vercel.outDir)
    }
  })
})
