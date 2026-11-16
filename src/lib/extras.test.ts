import { afterEach, describe, expect, test } from 'vitest'
import { buildRss, fillBuildStrip, formatKb, ogImagePath } from './extras'
import type { Post } from './content'

afterEach(() => { delete process.env.SITE_URL })

const post = (over: Partial<Post>): Post => ({
  id: '1', locale: 'nl', translationKey: 'a', slug: 'eerste-post', title: 'Eerste post', excerpt: 'Over <tools> & meer',
  bodyHtml: '<p>Tekst</p>', cover: '', coverAlt: '', publishedAt: '2026-11-12', tags: ['WaldJS'], ...over
})

describe('buildRss', () => {
  test('maakt een geldige RSS 2.0-feed met absolute links en geëscapete tekst', () => {
    process.env.SITE_URL = 'https://stefanvanderkort.nl'
    const xml = buildRss([post({})], 'nl', '2026-11-16T10:00:00Z')
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">')
    expect(xml).toContain('<link>https://stefanvanderkort.nl/blog/eerste-post</link>')
    expect(xml).toContain('<guid isPermaLink="true">https://stefanvanderkort.nl/blog/eerste-post</guid>')
    expect(xml).toContain('<description>Over &lt;tools&gt; &amp; meer</description>')
    expect(xml).toContain('<pubDate>Thu, 12 Nov 2026 00:00:00 GMT</pubDate>')
    expect(xml).toContain('<atom:link href="https://stefanvanderkort.nl/rss.xml" rel="self" type="application/rss+xml"/>')
    expect(xml).toContain('<language>nl-NL</language>')
  })
  test('Engelse feed staat onder /en en mag leeg zijn', () => {
    process.env.SITE_URL = 'https://stefanvanderkort.nl'
    const xml = buildRss([], 'en', '2026-11-16T10:00:00Z')
    expect(xml).toContain('<atom:link href="https://stefanvanderkort.nl/en/rss.xml"')
    expect(xml).toContain('<language>en-GB</language>')
    expect(xml).not.toContain('<item>')
  })
})

describe('ogImagePath', () => {
  test('geeft per pagina een vast, leesbaar bestandsnaam', () => {
    expect(ogImagePath('/')).toBe('/og/home.png')
    expect(ogImagePath('/en')).toBe('/og/en.png')
    expect(ogImagePath('/werk/waldjs')).toBe('/og/werk-waldjs.png')
    expect(ogImagePath('/en/work/centaur-cms/')).toBe('/og/en-work-centaur-cms.png')
  })
})

describe('build-strip', () => {
  test('formatKb rondt af op één decimaal, met komma in het Nederlands', () => {
    expect(formatKb(0, 'nl')).toBe('0 kB')
    expect(formatKb(15_360, 'nl')).toBe('15 kB')
    expect(formatKb(1_587, 'nl')).toBe('1,5 kB')
    expect(formatKb(1_587, 'en')).toBe('1.5 kB')
  })
  test('fillBuildStrip vult alleen de gemarkeerde plekken in', () => {
    const html = '<p><span data-build="html">–</span> · <span data-build="js">–</span> · <b data-build="x">–</b></p>'
    expect(fillBuildStrip(html, { html: '12 kB', js: '0 kB' })).toBe('<p><span data-build="html">12 kB</span> · <span data-build="js">0 kB</span> · <b data-build="x">–</b></p>')
  })
})
