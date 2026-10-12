import { existsSync, readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { defineConfig, vercelAdapter } from '@waldjs/cli'

// Lokaal staan de Centaur- en GitHub-gegevens in .env; op Vercel komen ze uit de project-env
// vars (die winnen, vandaar ??=). BOM strippen: sommige editors zetten er een voor.
if (existsSync('.env')) {
  const env = parseEnv(readFileSync('.env', 'utf8').replace(/^\uFEFF/, ''))
  for (const [key, value] of Object.entries(env)) process.env[key] ??= value
}

export default defineConfig({
  adapter: vercelAdapter()
})
