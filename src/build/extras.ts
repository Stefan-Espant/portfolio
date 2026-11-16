// Extra's na `wald build` (spec 2026-10-12, Extra's), aangeroepen vanuit de adapter in wald.config.ts:
// RSS-feeds, de build-strip (gemeten op de echte output) en een social-afbeelding per pagina.
// Faalt een social-afbeelding, dan komt er een waarschuwing en gaat de build door.
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { gzipSync } from 'node:zlib'
import { getLastContentUpdate, getPosts, getProjects } from '../lib/content'
import { buildRss, feedPath, fillBuildStrip, formatKb } from '../lib/extras'
import { LOCALES, formatDate, isLocale, type Locale } from '../lib/i18n'
import { SITE_NAME, absoluteUrl, siteUrl } from '../lib/site'
import { buildLlms, buildRobots, buildSitemap, type SitemapPage } from '../lib/seo'

type Context = { outDir: string }

const gz = (file: string) => gzipSync(readFileSync(file)).length

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? htmlFiles(path) : name.endsWith('.html') ? [path] : []
  })
}

/** Lokale scripts van een pagina, plus de modules die /motion/index.js importeert. */
function scriptFiles(html: string, outDir: string): string[] {
  const srcs = [...html.matchAll(/<script\b[^>]*\ssrc="(\/[^"]+\.js)"/g)].map(match => match[1])
  const files = srcs.map(src => join(outDir, src)).filter(file => { try { return statSync(file).isFile() } catch { return false } })
  for (const file of [...files]) {
    for (const [, spec] of readFileSync(file, 'utf8').matchAll(/from\s+'(\.\/[\w-]+\.js)'/g)) files.push(join(dirname(file), spec))
  }
  return [...new Set(files)]
}

async function writeFeeds(outDir: string, builtAt: string) {
  // RSS-lezers hebben absolute links nodig; lokaal zonder SITE_URL worden ze relatief.
  if (!siteUrl()) console.warn('  ⚠ geen SITE_URL of Vercel-domein: de links in de RSS-feeds zijn relatief')
  for (const locale of LOCALES) {
    const file = join(outDir, feedPath(locale))
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, buildRss(await getPosts(locale), locale, builtAt))
  }
  console.log(`  ✓ RSS-feeds: ${LOCALES.map(feedPath).join(', ')}`)
}

async function fillStrips(outDir: string, builtAt: string) {
  const contentDate = await getLastContentUpdate()
  for (const file of htmlFiles(outDir)) {
    const html = readFileSync(file, 'utf8')
    if (!html.includes('data-build=')) continue
    const lang = html.match(/<html[^>]*\slang="([a-z]{2})"/)?.[1]
      const locale: Locale = isLocale(lang) ? lang : 'nl'
    const scripts = scriptFiles(html, outDir)
    // WaldJS-runtime staat in /assets/; GSAP en de eigen scripts tellen alleen mee in het totaal.
    const framework = scripts.filter(script => relative(outDir, script).startsWith('assets'))
    const values = {
      // Kalenderdag in Nederlandse tijd, niet in UTC (een build om 00:30 hoort bij die dag).
      built: formatDate(new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Amsterdam' }).format(new Date(builtAt)), locale),
      content: contentDate ? formatDate(contentDate, locale) : '–',
      js: formatKb(framework.reduce((sum, script) => sum + gz(script), 0), locale),
      'js-total': formatKb(scripts.reduce((sum, script) => sum + gz(script), 0), locale)
    }
    // Eerst invullen, dan het HTML-gewicht meten van de pagina zoals hij verstuurd wordt.
    const filled = fillBuildStrip(html, values)
    writeFileSync(file, fillBuildStrip(filled, { html: formatKb(gzipSync(filled).length, locale) }))
  }
  console.log('  ✓ build-strip ingevuld')
}

/** Titel voor de afbeelding: zonder " — Stefan van der Kort"; bij de home het deel na "Stefan van der Kort — ". */
function ogTitle(title: string): string {
  const [first, ...rest] = title.split(' — ')
  if (first === SITE_NAME && rest.length) return rest.join(' — ').replace(/^./, char => char.toUpperCase())
  return first
}

async function writeOgImages(outDir: string) {
  const [{ default: satori }, { Resvg }] = await Promise.all([import('satori'), import('@resvg/resvg-js')])
  const font = (file: string) => readFileSync(join(process.cwd(), 'src/build/fonts', file))
  const fonts = [
    { name: 'Bricolage', data: font('bricolage-grotesque-600.ttf'), weight: 600 as const, style: 'normal' as const },
    { name: 'Inter', data: font('inter-500.ttf'), weight: 500 as const, style: 'normal' as const },
    { name: 'Fraunces', data: font('fraunces-italic-400.ttf'), weight: 400 as const, style: 'italic' as const }
  ]
  let count = 0
  for (const file of htmlFiles(outDir)) {
    const html = readFileSync(file, 'utf8')
    const image = html.match(/<meta property="og:image" content="(?:https?:\/\/[^/"]+)?(\/og\/[\w-]+\.png)"/)?.[1]
    const title = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1]
    if (!image || !title) continue
    const text = ogTitle(title.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"'))
    try {
      const locale: Locale = /<html[^>]*\slang="en"/.test(html) ? 'en' : 'nl'
      const svg = await satori(card(text, locale), { width: 1200, height: 630, fonts })
      const target = join(outDir, image)
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, new Resvg(svg).render().asPng())
      count++
    } catch (error) {
      console.warn(`  ⚠ social-afbeelding voor "${text}" mislukt:`, error instanceof Error ? error.message : error)
    }
  }
  console.log(`  ✓ ${count} social-afbeeldingen`)
}

const TAGLINES: Record<Locale, string> = { nl: 'van framework tot frontend', en: 'from framework to frontend', de: 'vom Framework bis zum Frontend' }

/** De kaart van 1200×630: ijsblauw met de blauwe gloed, het woordmerk en de titel in Bricolage. */
function card(title: string, locale: Locale) {
  const size = title.length > 48 ? 76 : title.length > 28 ? 92 : 112
  return {
    type: 'div',
    key: 'card',
    props: {
      style: {
        // Satori telt padding bij width/height op: binnenmaten zo kiezen dat het geheel 1200×630 is.
        width: 1200 - 2 * 72, height: 630 - 2 * 64, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '64px 72px', backgroundColor: '#f3f5ff', color: '#16161a', fontFamily: 'Inter',
        backgroundImage: 'radial-gradient(60% 70% at 92% 0%, rgba(48,70,255,0.22), rgba(243,245,255,0) 70%), radial-gradient(50% 60% at 0% 100%, rgba(27,34,201,0.12), rgba(243,245,255,0) 70%)'
      },
      children: [
        { type: 'div', props: { style: { display: 'flex', fontFamily: 'Bricolage', fontSize: 40, letterSpacing: -1.6 }, children: SITE_NAME } },
        { type: 'div', props: { style: { display: 'flex', fontFamily: 'Bricolage', fontSize: size, lineHeight: 1, letterSpacing: -size * 0.045, maxWidth: 1000 }, children: title } },
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 28, color: '#5f5f66' },
            children: [
              { type: 'div', props: { style: { display: 'flex', fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 34, color: '#3046ff' }, children: TAGLINES[locale] } },
              { type: 'div', props: { style: { display: 'flex', width: 180, height: 10, borderRadius: 10, backgroundImage: 'linear-gradient(90deg, #1b22c9, #3046ff, #3a63f0)' }, children: '' } }
            ]
          }
        }
      ]
    }
  }
}

/** sitemap.xml, robots.txt en llms.txt. De sitemap leest canonical en hreflang uit de gebouwde HTML,
 *  zodat hij altijd precies de pagina's bevat die er zijn; noindex-pagina's (404) vallen af. */
async function writeCrawlerFiles(outDir: string, builtAt: string) {
  const pages: SitemapPage[] = []
  for (const file of htmlFiles(outDir)) {
    const html = readFileSync(file, 'utf8')
    if (/<meta name="robots" content="noindex/.test(html)) continue
    const loc = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
    if (!loc) continue
    const alternates = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([\w-]+)" href="([^"]+)"/g)].map(([, lang, href]) => [lang, href]))
    pages.push({ loc, alternates })
  }
  writeFileSync(join(outDir, 'sitemap.xml'), buildSitemap(pages, builtAt.slice(0, 10)))
  writeFileSync(join(outDir, 'robots.txt'), buildRobots(absoluteUrl('/sitemap.xml')))
  writeFileSync(join(outDir, 'llms.txt'), buildLlms({ projects: await getProjects('en'), posts: await getPosts('en') }))
  console.log(`  ✓ sitemap.xml (${pages.length} pagina's), robots.txt en llms.txt`)
}

export async function writeExtras({ outDir }: Context): Promise<void> {
  const builtAt = new Date().toISOString()
  console.log('  Extra\'s')
  await writeFeeds(outDir, builtAt)
  await writeCrawlerFiles(outDir, builtAt)
  await fillStrips(outDir, builtAt)
  await writeOgImages(outDir)
}
