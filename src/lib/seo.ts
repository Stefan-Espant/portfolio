// Vindbaarheid voor zoekmachines (SEO) en AI-assistenten (GEO): gestructureerde data (schema.org JSON-LD),
// de sitemap, robots.txt en llms.txt. Alleen pure functies; de Layout zet de JSON-LD in <head> en
// src/build/extras.ts schrijft de bestanden na de build.
import type { Post, Project } from './content'
import { LOCALES, localePath, plain, t, type Locale, type MessageKey } from './i18n'
import { CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL, SITE_NAME, absoluteUrl } from './site'

type Json = Record<string, unknown>

const LANG: Record<Locale, string> = { nl: 'nl-NL', en: 'en-GB', de: 'de-DE' }
const JOB_TITLE: Record<Locale, string> = {
  nl: 'Frontend developer en designer',
  en: 'Frontend developer and designer',
  de: 'Frontend-Entwickler und Designer'
}
const KNOWS_ABOUT = ['Frontend development', 'Web design', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Accessibility', 'Web performance', 'Vue', 'Nuxt', 'SvelteKit', 'Node.js', '.NET', 'Headless CMS', 'Graphic design', 'Print design']

export const PERSON_ID = () => absoluteUrl('/#person')
export const WEBSITE_ID = () => absoluteUrl('/#website')

/** Wie Stefan is: één Person-node die alle andere nodes via @id aanhalen. */
export function personNode(locale: Locale): Json {
  return {
    '@type': 'Person',
    '@id': PERSON_ID(),
    name: SITE_NAME,
    givenName: 'Stefan',
    familyName: 'van der Kort',
    url: absoluteUrl(localePath('home', locale)),
    image: absoluteUrl('/images/stefan/webp/stefan-376.webp'),
    jobTitle: JOB_TITLE[locale],
    email: `mailto:${CONTACT_EMAIL}`,
    worksFor: { '@type': 'Organization', name: 'Esens Design' },
    founder: { '@type': 'Organization', name: 'Espant Design' },
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'Hogeschool van Amsterdam', sameAs: 'https://www.hva.nl' },
      { '@type': 'EducationalOrganization', name: 'Mediacollege Amsterdam', sameAs: 'https://www.ma-web.nl' }
    ],
    knowsAbout: KNOWS_ABOUT,
    knowsLanguage: ['nl', 'en', 'de'],
    sameAs: [GITHUB_URL, LINKEDIN_URL, 'https://waldjs.eu', 'https://centaur-cms.app']
  }
}

export function websiteNode(locale: Locale): Json {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID(),
    url: absoluteUrl('/'),
    name: SITE_NAME,
    description: plain(t('home.description', locale)),
    inLanguage: LOCALES.map(code => LANG[code]),
    author: { '@id': PERSON_ID() },
    publisher: { '@id': PERSON_ID() }
  }
}

export function breadcrumbNode(items: Array<[name: string, path: string]>): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], index) => ({ '@type': 'ListItem', position: index + 1, name, item: absoluteUrl(path) }))
  }
}

/** Een project als CreativeWork; WaldJS (met npm-pakket) als SoftwareSourceCode. */
export function projectNode(project: Project, locale: Locale): Json {
  const url = absoluteUrl(localePath('project', locale, project.slug))
  const node: Json = {
    '@type': project.npmPackage ? 'SoftwareSourceCode' : project.type === 'website' || project.type === 'hobby' || project.type === 'product' ? 'WebSite' : 'CreativeWork',
    '@id': `${url}#work`,
    name: project.title,
    url,
    inLanguage: LANG[locale],
    creator: { '@id': PERSON_ID() },
    keywords: project.stack.join(', ') || undefined,
    image: project.cover || undefined,
    description: project.summary || undefined,
    dateCreated: project.year ? String(project.year) : undefined,
    sameAs: [project.liveUrl, project.repoUrl].filter(Boolean)
  }
  if (project.npmPackage) {
    node.codeRepository = project.repoUrl || undefined
    node.programmingLanguage = 'TypeScript'
    node.license = 'https://opensource.org/licenses/MIT'
  }
  if (project.client && project.type !== 'school') node.sourceOrganization = { '@type': 'Organization', name: project.client }
  return node
}

export function postNode(post: Post, locale: Locale): Json {
  const url = absoluteUrl(localePath('post', locale, post.slug))
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.excerpt || undefined,
    url,
    mainEntityOfPage: url,
    inLanguage: LANG[locale],
    image: post.cover || undefined,
    datePublished: post.publishedAt || undefined,
    keywords: post.tags.join(', ') || undefined,
    author: { '@id': PERSON_ID() },
    publisher: { '@id': PERSON_ID() },
    isPartOf: { '@id': WEBSITE_ID() }
  }
}

export function profilePageNode(locale: Locale): Json {
  return {
    '@type': 'ProfilePage',
    url: absoluteUrl(localePath('about', locale)),
    inLanguage: LANG[locale],
    mainEntity: { '@id': PERSON_ID() },
    isPartOf: { '@id': WEBSITE_ID() }
  }
}

/** Alles in één @graph, als <script type="application/ld+json">. "<" wordt ge-escapet zodat tekst de tag nooit sluit. */
export function jsonLdScript(nodes: Json[]): string {
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c')
  return `<script type="application/ld+json" data-wald-no-hoist>${json}</script>`
}

// ── Bestanden voor crawlers ────────────────────────────────────────────────────────────

const xml = (text: string) => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!)

export interface SitemapPage {
  /** Absolute canonical URL. */
  loc: string
  /** hreflang → absolute URL, inclusief x-default. */
  alternates: Record<string, string>
}

/** sitemap.xml met hreflang-alternates per pagina (Google: xhtml:link). */
export function buildSitemap(pages: SitemapPage[], lastmod: string): string {
  const urls = [...pages].sort((a, b) => a.loc.localeCompare(b.loc)).map(page => {
    const links = Object.entries(page.alternates)
      .map(([lang, href]) => `\n    <xhtml:link rel="alternate" hreflang="${xml(lang)}" href="${xml(href)}"/>`).join('')
    return `  <url>\n    <loc>${xml(page.loc)}</loc>\n    <lastmod>${xml(lastmod)}</lastmod>${links}\n  </url>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`
}

/** robots.txt: alles mag, ook AI-crawlers (GEO), met een verwijzing naar de sitemap. */
export function buildRobots(sitemapUrl: string): string {
  const aiBots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended']
  return [
    'User-agent: *',
    'Allow: /',
    '',
    '# AI-assistenten mogen deze site lezen en citeren.',
    ...aiBots.flatMap(bot => [`User-agent: ${bot}`, 'Allow: /', '']),
    `Sitemap: ${sitemapUrl}`,
    ''
  ].join('\n')
}

const md = (text: string) => text.replace(/[[\]]/g, '\\$&').replace(/\s+/g, ' ').trim()

/** llms.txt (llmstxt.org): een korte, feitelijke samenvatting in Markdown voor AI-assistenten. */
export function buildLlms(input: { projects: Project[]; posts: Post[] }): string {
  const projects = input.projects.map(project => {
    const facts = [t(`type.${project.type}` as MessageKey, 'en'), project.year ? String(project.year) : '', project.stack.join(', ')].filter(Boolean).join(' · ')
    return `- [${md(project.title)}](${absoluteUrl(localePath('project', 'en', project.slug))}): ${md(project.summary || project.title)}${facts ? ` (${md(facts)})` : ''}`
  })
  const posts = input.posts.map(post => `- [${md(post.title)}](${absoluteUrl(localePath('post', 'en', post.slug))}): ${md(post.excerpt)}`)
  return [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_NAME} is a frontend developer and designer from the Netherlands who designs and builds fast, accessible websites, and the creator of the static-first web framework WaldJS and the headless CMS Centaur CMS.`,
    '',
    '- Graduate of Frontend Design & Development at the Amsterdam University of Applied Sciences (Hogeschool van Amsterdam), and earlier Media Design and Desktop Publishing at Mediacollege Amsterdam.',
    '- Junior frontend developer at Esens Design since September 2024, and owner of Espant Design (graphic and web design).',
    '- Works with HTML, CSS, JavaScript, TypeScript, Vue/Nuxt, SvelteKit, Node.js, .NET 8, PostgreSQL, Figma and Adobe Creative Cloud.',
    '- The site is available in Dutch (default, /), English (/en) and German (/de).',
    '',
    '## Pages',
    '',
    `- [About](${absoluteUrl(localePath('about', 'en'))}): background, experience and skills`,
    `- [Work](${absoluteUrl(localePath('work', 'en'))}): all projects with the choices behind them`,
    `- [Blog](${absoluteUrl(localePath('blog', 'en'))}): articles about web development and design`,
    `- [Contact](${absoluteUrl(localePath('contact', 'en'))}): ${CONTACT_EMAIL}`,
    '',
    '## Projects',
    '',
    ...(projects.length ? projects : ['- (no published projects yet)']),
    '',
    '## Articles',
    '',
    ...(posts.length ? posts : ['- (no published articles yet)']),
    '',
    '## Elsewhere',
    '',
    `- [GitHub](${GITHUB_URL})`,
    `- [LinkedIn](${LINKEDIN_URL})`,
    '- [WaldJS](https://waldjs.eu): the web framework',
    '- [Centaur CMS](https://centaur-cms.app): the headless CMS',
    ''
  ].join('\n')
}
