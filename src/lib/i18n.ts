// Talen, routes en UI-teksten. Nederlands staat zonder prefix, Engels onder /en.
// Content-teksten (projecten, posts) komen uit Centaur; hier alleen de vaste UI-teksten.

export const LOCALES = ['nl', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const isLocale = (value: unknown): value is Locale => LOCALES.includes(value as Locale)
export const otherLocale = (locale: Locale): Locale => (locale === 'nl' ? 'en' : 'nl')

export type RouteName = 'home' | 'work' | 'project' | 'blog' | 'post' | 'about' | 'contact'

const ROUTES: Record<RouteName, Record<Locale, string>> = {
  home: { nl: '/', en: '/en' },
  work: { nl: '/werk', en: '/en/work' },
  project: { nl: '/werk/:slug', en: '/en/work/:slug' },
  blog: { nl: '/blog', en: '/en/blog' },
  post: { nl: '/blog/:slug', en: '/en/blog/:slug' },
  about: { nl: '/over', en: '/en/about' },
  contact: { nl: '/contact', en: '/en/contact' }
}

export function localePath(route: RouteName, locale: Locale, slug?: string): string {
  const pattern = ROUTES[route][locale]
  if (!pattern.includes(':slug')) return pattern
  if (!slug) throw new Error(`Route "${route}" heeft een slug nodig`)
  return pattern.replace(':slug', encodeURIComponent(slug))
}

// Accentwoorden staan tussen sterretjes: accent() maakt er een cursieve <em> van, plain() haalt ze weg.
const nl = {
  'nav.label': 'Hoofdnavigatie',
  'nav.breadcrumb': 'Kruimelpad',
  'nav.work': 'Werk',
  'nav.blog': 'Blog',
  'nav.about': 'Over',
  'nav.contact': 'Contact',
  'skip': 'Naar de inhoud',
  'lang.switch': 'EN',
  'lang.label': 'English',
  'theme.label': 'Donker thema',
  'home.title': 'Steefan — frontend developer en designer',
  'home.description': 'Portfolio van Stefan, frontend developer en designer en maker van WaldJS en Centaur CMS: snelle, toegankelijke websites, van framework tot frontend.',
  'home.heading': 'Snelle, toegankelijke websites, *van framework tot frontend.*',
  'home.lead': 'Ik ben Stefan, frontend developer en designer. Ik ontwerp en bouw websites en de tools daarachter: een eigen webframework, WaldJS, en een eigen CMS, Centaur. Zo heb ik elke laag in handen, van het eerste ontwerp tot de laatste kilobyte.',
  'home.featured': 'Uitgelicht werk',
  'home.empty': 'Hier verschijnen binnenkort de projecten.',
  'home.statLabel': 'Framework-JavaScript per pagina',
  'home.statValue': '0 KB',
  'home.statNote': 'Standaard in WaldJS. Interactie alleen waar het nodig is.',
  'home.noteText': 'Open source op npm, met een CLI, een projectgenerator en een VS Code-extensie.',
  'home.noteCode': 'npm create wald',
  'home.clients': 'Gewerkt *met*',
  'status.available': 'Beschikbaar:',
  'status.unavailable': 'Niet beschikbaar:',
  'home.other': 'Eerder *werk*',
  'home.otherNote': 'opdrachten en studieprojecten',
  'home.about': 'Over *mij*',
  'home.aboutText': 'Frontend developer en designer, student aan de opleiding Frontend Design & Development van de HvA.',
  'home.aboutMore': 'Ik werk het liefst op het snijvlak van ontwerp en code: een interface die tot in de details klopt, met techniek eronder die net zo zorgvuldig is gebouwd. Daarom schrijf ik ook mijn eigen tools.',
  'home.aboutLink': 'Meer over mij',
  'home.skills': 'Werkt met',
  'home.blog': 'Uit de *blog*',
  'home.blogAll': 'Alle artikelen',
  'home.ctaTitle': 'Heb je een project *in gedachten?*',
  'home.ctaText': 'Een nieuwe website, een bestaande die sneller moet, of een samenwerking rond WaldJS of Centaur. Vertel me waar je aan werkt.',
  'home.cta': 'Neem contact op',
  'type.framework': 'Framework',
  'type.product': 'Product',
  'type.website': 'Website',
  'type.school': 'Studieproject',
  'work.title': 'Werk',
  'work.description': 'Alle projecten van Stefan: een eigen framework en CMS, websites en studieprojecten.',
  'work.heading': 'Mijn *werk*',
  'work.lead': 'Van een eigen framework en CMS tot websites en studieprojecten. Elk project met de keuzes erachter.',
  'work.filterLabel': 'Filter op type',
  'work.filterAll': 'Alles',
  'work.count': '{n} projecten',
  'project.process': 'Probleem, aanpak, *resultaat*',
  'project.problem': 'Probleem',
  'project.approach': 'Aanpak',
  'project.result': 'Resultaat',
  'project.metrics': 'In *cijfers*',
  'project.type': 'Soort',
  'project.year': 'Jaar',
  'project.stack': 'Stack',
  'project.links': 'Links',
  'project.live': 'Bekijk live',
  'project.repo': 'Broncode',
  'project.design': 'Ontwerp',
  'project.npm': 'npm-pakket',
  'project.gallery': '*Beelden*',
  'project.client': 'Klant',
  'project.next': 'Volgend project',
  'blog.title': 'Blog',
  'blog.description': 'Artikelen van Stefan over webdevelopment, design en het bouwen van eigen tools.',
  'blog.heading': '*Blog*',
  'blog.lead': 'Over webdevelopment, design en het bouwen van eigen tools. Met de keuzes, de fouten en wat ik ervan leerde.',
  'blog.empty': 'Hier verschijnen binnenkort de eerste artikelen.',
  'post.back': 'Blog',
  'post.readingTime': '{n} min lezen',
  'post.next': 'Volgend artikel',
  'about.title': 'Over',
  'about.description': 'Over Stefan: wat ik doe, ervaring en skills.',
  'about.heading': 'Over *mij*',
  'about.lead': 'Ik ben Stefan, frontend developer en designer. Ik studeer aan de opleiding Frontend Design & Development van de HvA en bouw daarnaast mijn eigen tools.',
  'about.portrait': 'Portret van Stefan',
  'about.what': 'Wat ik *doe*',
  'about.what1Title': 'Ontwerp',
  'about.what1Text': 'Interfaces en websites, van eerste schets tot een ontwerp dat developers zonder vragen kunnen bouwen.',
  'about.what2Title': 'Frontend',
  'about.what2Text': 'Snelle, toegankelijke sites met semantische HTML, moderne CSS en JavaScript alleen waar het iets toevoegt.',
  'about.what3Title': 'Tools',
  'about.what3Text': 'Een eigen framework en CMS, zodat de techniek past bij het project in plaats van andersom.',
  'about.experience': '*Ervaring*',
  'about.present': 'heden',
  'about.kind.werk': 'Werk',
  'about.kind.opleiding': 'Opleiding',
  'about.skills': '*Skills*',
  'about.github': 'Recent op *GitHub*',
  'about.cv': 'Download mijn cv (pdf)',
  'contact.title': 'Contact',
  'contact.description': 'Neem contact op met Stefan voor een opdracht, samenwerking of vraag.',
  'contact.heading': 'Laten we iets *bouwen.*',
  'contact.lead': 'Een opdracht, een samenwerking of gewoon een vraag? Vertel kort waar je aan werkt, dan reageer ik zo snel mogelijk.',
  'contact.mail': 'Liever mailen?',
  'contact.other': 'Elders',
  'contact.code': 'Op zoek naar code?',
  'contact.codeText': 'WaldJS staat open source op GitHub en npm. Begin met',
  'form.name': 'Naam',
  'form.email': 'E-mailadres',
  'form.message': 'Bericht',
  'form.send': 'Verstuur bericht',
  'form.sending': 'Versturen…',
  'form.success': 'Bedankt! Je bericht is verstuurd.',
  'form.error': 'Versturen is mislukt. Probeer het later opnieuw of mail me direct.',
  'form.noJs': 'Het formulier werkt met JavaScript. Mail me anders direct:',
  'footer.text': 'Ontworpen en gebouwd door Stefan, met WaldJS, Centaur CMS en Byzantium.',
  'footer.pages': "Pagina's",
  'footer.elsewhere': 'Elders',
  'notFound.title': 'Pagina niet gevonden',
  'notFound.body': 'Deze pagina bestaat niet (meer).',
  'notFound.back': 'Terug naar home'
} as const

export type MessageKey = keyof typeof nl
export const MESSAGE_KEYS = Object.keys(nl) as MessageKey[]

const en: Record<MessageKey, string> = {
  'nav.label': 'Main navigation',
  'nav.breadcrumb': 'Breadcrumb',
  'nav.work': 'Work',
  'nav.blog': 'Blog',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'skip': 'Skip to content',
  'lang.switch': 'NL',
  'lang.label': 'Nederlands',
  'theme.label': 'Dark theme',
  'home.title': 'Steefan — frontend developer and designer',
  'home.description': 'Portfolio of Stefan, frontend developer and designer and creator of WaldJS and Centaur CMS: fast, accessible websites, from framework to frontend.',
  'home.heading': 'Fast, accessible websites, *from framework to frontend.*',
  'home.lead': "I'm Stefan, a frontend developer and designer. I design and build websites and the tools behind them: my own web framework, WaldJS, and my own CMS, Centaur. That puts every layer in my hands, from the first design to the last kilobyte.",
  'home.featured': 'Featured work',
  'home.empty': 'Projects will appear here soon.',
  'home.statLabel': 'Framework JavaScript per page',
  'home.statValue': '0 KB',
  'home.statNote': 'Default in WaldJS. Interactivity only where it is needed.',
  'home.noteText': 'Open source on npm, with a CLI, a project generator and a VS Code extension.',
  'home.noteCode': 'npm create wald',
  'home.clients': 'Worked *with*',
  'status.available': 'Available:',
  'status.unavailable': 'Not available:',
  'home.other': 'Earlier *work*',
  'home.otherNote': 'client and study projects',
  'home.about': 'About *me*',
  'home.aboutText': 'Frontend developer and designer, studying Frontend Design & Development at the Amsterdam University of Applied Sciences.',
  'home.aboutMore': 'I like working where design and code meet: an interface that is right down to the details, with technology underneath that is built just as carefully. That is why I also write my own tools.',
  'home.aboutLink': 'More about me',
  'home.skills': 'Works with',
  'home.blog': 'From the *blog*',
  'home.blogAll': 'All articles',
  'home.ctaTitle': 'Have a project *in mind?*',
  'home.ctaText': 'A new website, an existing one that needs to be faster, or a collaboration around WaldJS or Centaur. Tell me what you are working on.',
  'home.cta': 'Get in touch',
  'type.framework': 'Framework',
  'type.product': 'Product',
  'type.website': 'Website',
  'type.school': 'Study project',
  'work.title': 'Work',
  'work.description': "All of Stefan's projects: his own framework and CMS, websites and study projects.",
  'work.heading': 'My *work*',
  'work.lead': 'From my own framework and CMS to websites and study projects. Every project with the choices behind it.',
  'work.filterLabel': 'Filter by type',
  'work.filterAll': 'All',
  'work.count': '{n} projects',
  'project.process': 'Problem, approach, *result*',
  'project.problem': 'Problem',
  'project.approach': 'Approach',
  'project.result': 'Result',
  'project.metrics': 'In *numbers*',
  'project.type': 'Type',
  'project.year': 'Year',
  'project.stack': 'Stack',
  'project.links': 'Links',
  'project.live': 'View live',
  'project.repo': 'Source code',
  'project.design': 'Design',
  'project.npm': 'npm package',
  'project.gallery': '*Images*',
  'project.client': 'Client',
  'project.next': 'Next project',
  'blog.title': 'Blog',
  'blog.description': 'Articles by Stefan about web development, design and building your own tools.',
  'blog.heading': '*Blog*',
  'blog.lead': 'About web development, design and building your own tools. With the choices, the mistakes and what I learned from them.',
  'blog.empty': 'The first articles will appear here soon.',
  'post.back': 'Blog',
  'post.readingTime': '{n} min read',
  'post.next': 'Next article',
  'about.title': 'About',
  'about.description': 'About Stefan: what I do, experience and skills.',
  'about.heading': 'About *me*',
  'about.lead': "I'm Stefan, a frontend developer and designer. I study Frontend Design & Development at the Amsterdam University of Applied Sciences and build my own tools on the side.",
  'about.portrait': 'Portrait of Stefan',
  'about.what': 'What I *do*',
  'about.what1Title': 'Design',
  'about.what1Text': 'Interfaces and websites, from first sketch to a design developers can build without questions.',
  'about.what2Title': 'Frontend',
  'about.what2Text': 'Fast, accessible sites with semantic HTML, modern CSS and JavaScript only where it adds something.',
  'about.what3Title': 'Tools',
  'about.what3Text': 'My own framework and CMS, so the technology fits the project instead of the other way around.',
  'about.experience': '*Experience*',
  'about.present': 'present',
  'about.kind.werk': 'Work',
  'about.kind.opleiding': 'Education',
  'about.skills': '*Skills*',
  'about.github': 'Recently on *GitHub*',
  'about.cv': 'Download my CV (pdf)',
  'contact.title': 'Contact',
  'contact.description': 'Get in touch with Stefan about a project, collaboration or question.',
  'contact.heading': "Let's build *something.*",
  'contact.lead': 'A project, a collaboration or just a question? Tell me briefly what you are working on and I will get back to you as soon as I can.',
  'contact.mail': 'Rather email?',
  'contact.other': 'Elsewhere',
  'contact.code': 'Looking for code?',
  'contact.codeText': 'WaldJS is open source on GitHub and npm. Start with',
  'form.name': 'Name',
  'form.email': 'Email address',
  'form.message': 'Message',
  'form.send': 'Send message',
  'form.sending': 'Sending…',
  'form.success': 'Thanks! Your message has been sent.',
  'form.error': 'Sending failed. Please try again later or email me directly.',
  'form.noJs': 'The form needs JavaScript. Otherwise email me directly:',
  'footer.text': 'Designed and built by Stefan, with WaldJS, Centaur CMS and Byzantium.',
  'footer.pages': 'Pages',
  'footer.elsewhere': 'Elsewhere',
  'notFound.title': 'Page not found',
  'notFound.body': 'This page does not exist (anymore).',
  'notFound.back': 'Back to home'
}

const MESSAGES: Record<Locale, Record<MessageKey, string>> = { nl, en }

export function t(key: MessageKey, locale: Locale): string {
  return MESSAGES[locale][key]
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/** Tekst als veilige HTML waarin *woorden tussen sterretjes* een <em> worden (het cursieve accent in koppen). */
export function accent(text: string): string {
  return text.replace(/[&<>"']/g, char => ESCAPES[char]).replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

/** Dezelfde tekst zonder de accent-sterretjes, voor <title>, meta-tags en aria-labels. */
export function plain(text: string): string {
  return text.replace(/\*([^*]+)\*/g, '$1')
}

/** Taalwissel: naar dezelfde pagina in de andere taal, of naar die home als er geen vertaling is. */
export function langSwitchHref(alternates: Partial<Record<Locale, string>>, locale: Locale): string {
  const other = otherLocale(locale)
  return alternates[other] ?? localePath('home', other)
}

const intlLocale = (locale: Locale) => (locale === 'nl' ? 'nl-NL' : 'en-GB')

function toDate(iso: string): Date | null {
  if (!iso) return null
  // Alleen de kalenderdatum gebruiken: een tijd met tijdzone zou de dag kunnen verschuiven, afhankelijk van de tijdzone van de buildmachine.
  const day = /^\d{4}-\d{2}-\d{2}/.exec(iso)
  const date = new Date(day ? day[0] : iso)
  return Number.isNaN(date.getTime()) ? null : date
}

/** "1 mei 2024" / "1 May 2024"; lege string bij een ongeldige datum. */
export function formatDate(iso: string, locale: Locale): string {
  const date = toDate(iso)
  return date ? new Intl.DateTimeFormat(intlLocale(locale), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date) : ''
}

/** "sep 2023" / "Sept 2023" (voor de cv-tijdlijn). */
export function formatMonth(iso: string, locale: Locale): string {
  const date = toDate(iso)
  return date ? new Intl.DateTimeFormat(intlLocale(locale), { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date).replace(/\./g, '') : ''
}
