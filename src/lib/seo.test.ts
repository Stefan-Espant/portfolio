import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type { Post, Project } from './content'
import { breadcrumbNode, buildLlms, buildRobots, buildSitemap, jsonLdScript, personNode, postNode, projectNode, websiteNode } from './seo'

const project: Project = {
  id: 'p', locale: 'en', translationKey: 'wald', slug: 'waldjs', title: 'WaldJS', summary: 'My own framework.', type: 'framework',
  featured: true, order: 1, year: 2026, client: '', stack: ['TypeScript', 'Vite'], cover: 'https://cdn/c.webp', coverAlt: '',
  problemHtml: '', approachHtml: '', resultHtml: '', gallery: [], liveUrl: 'https://waldjs.eu', repoUrl: 'https://github.com/x/wald',
  designUrl: '', npmPackage: '@waldjs/cli', metrics: []
}
const post: Post = {
  id: 'b', locale: 'de', translationKey: 'w', slug: 'warum', title: 'Warum </script>', excerpt: 'Kurz.', bodyHtml: '', cover: '',
  coverAlt: '', publishedAt: '2026-11-16', tags: ['WaldJS']
}

describe('seo', () => {
  beforeEach(() => vi.stubEnv('SITE_URL', 'https://stefanvanderkort.nl'))
  afterEach(() => vi.unstubAllEnvs())

  test('Person en WebSite verwijzen naar elkaar via @id', () => {
    const person = personNode('nl')
    expect(person).toMatchObject({ '@type': 'Person', '@id': 'https://stefanvanderkort.nl/#person', name: 'Stefan van der Kort', url: 'https://stefanvanderkort.nl/' })
    expect(person.sameAs).toContain('https://github.com/Stefan-Espant')
    expect(websiteNode('de')).toMatchObject({ '@id': 'https://stefanvanderkort.nl/#website', inLanguage: ['nl-NL', 'en-GB', 'de-DE'], author: { '@id': 'https://stefanvanderkort.nl/#person' } })
  })

  test('project met npm-pakket wordt SoftwareSourceCode met de juiste URL', () => {
    expect(projectNode(project, 'en')).toMatchObject({
      '@type': 'SoftwareSourceCode', url: 'https://stefanvanderkort.nl/en/work/waldjs', codeRepository: 'https://github.com/x/wald',
      keywords: 'TypeScript, Vite', sameAs: ['https://waldjs.eu', 'https://github.com/x/wald']
    })
    expect(projectNode({ ...project, npmPackage: '', type: 'print', client: 'Op Dorp' }, 'nl')).toMatchObject({
      '@type': 'CreativeWork', url: 'https://stefanvanderkort.nl/werk/waldjs', sourceOrganization: { name: 'Op Dorp' }
    })
  })

  test('blogpost en kruimelpad', () => {
    expect(postNode(post, 'de')).toMatchObject({ '@type': 'BlogPosting', url: 'https://stefanvanderkort.nl/de/blog/warum', datePublished: '2026-11-16', inLanguage: 'de-DE' })
    expect(breadcrumbNode([['Blog', '/blog'], ['Post', '/blog/x']]).itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Blog', item: 'https://stefanvanderkort.nl/blog' },
      { '@type': 'ListItem', position: 2, name: 'Post', item: 'https://stefanvanderkort.nl/blog/x' }
    ])
  })

  test('jsonLdScript escapet "<" zodat een titel de scripttag niet sluit', () => {
    const script = jsonLdScript([postNode(post, 'de')])
    expect(script).toMatch(/^<script type="application\/ld\+json" data-wald-no-hoist>/)
    expect(script).not.toContain('</script>"')
    expect(script).toContain('\\u003c/script>')
    expect(JSON.parse(script.replace(/^<script[^>]*>|<\/script>$/g, ''))['@context']).toBe('https://schema.org')
  })

  test('sitemap met hreflang-alternates', () => {
    const xml = buildSitemap([{ loc: 'https://stefanvanderkort.nl/', alternates: { nl: 'https://stefanvanderkort.nl/', en: 'https://stefanvanderkort.nl/en', 'x-default': 'https://stefanvanderkort.nl/' } }], '2026-11-16')
    expect(xml).toContain('<loc>https://stefanvanderkort.nl/</loc>')
    expect(xml).toContain('<lastmod>2026-11-16</lastmod>')
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="en" href="https://stefanvanderkort.nl/en"/>')
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
  })

  test('robots.txt laat ook AI-crawlers toe en wijst naar de sitemap', () => {
    const robots = buildRobots('https://stefanvanderkort.nl/sitemap.xml')
    expect(robots).toContain('User-agent: GPTBot\nAllow: /')
    expect(robots).toContain('User-agent: ClaudeBot\nAllow: /')
    expect(robots).not.toContain('Disallow')
    expect(robots).toContain('Sitemap: https://stefanvanderkort.nl/sitemap.xml')
  })

  test('llms.txt somt projecten en artikelen op', () => {
    const llms = buildLlms({ projects: [project], posts: [{ ...post, locale: 'en', title: 'Why [I]' }] })
    expect(llms).toMatch(/^# Stefan van der Kort\n/)
    expect(llms).toContain('- [WaldJS](https://stefanvanderkort.nl/en/work/waldjs): My own framework. (Framework · 2026 · TypeScript, Vite)')
    expect(llms).toContain('[Why \\[I\\]](https://stefanvanderkort.nl/en/blog/warum)')
  })
})
