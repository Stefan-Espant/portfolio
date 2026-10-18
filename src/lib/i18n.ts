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

const nl = {
  'nav.label': 'Hoofdnavigatie',
  'nav.work': 'Werk',
  'nav.blog': 'Blog',
  'nav.about': 'Over',
  'nav.contact': 'Contact',
  'skip': 'Naar de inhoud',
  'lang.switch': 'English',
  'home.title': 'Steefan — developer en designer',
  'home.description': 'Portfolio van Stefan: maker van WaldJS en Centaur CMS, frontend developer en designer.',
  'home.heading': 'Ik bouw mijn eigen tools.',
  'home.lead': 'Framework-auteur, CMS-bouwer en frontend developer.',
  'home.featured': 'Uitgelicht werk',
  'home.empty': 'Hier verschijnen binnenkort de projecten.',
  'home.clients': 'Gewerkt met',
  'status.available': 'Beschikbaar:',
  'status.unavailable': 'Niet beschikbaar:',
  'home.other': 'Ander werk',
  'home.about': 'Over mij',
  'home.aboutText': 'Ik ben Stefan, frontend developer en designer. Ik bouw snelle, toegankelijke websites en de tools waarmee ik ze maak: een eigen framework en een eigen CMS.',
  'home.aboutLink': 'Meer over mij',
  'home.blog': 'Uit de blog',
  'home.cta': 'Zullen we praten?',
  'type.framework': 'Framework',
  'type.product': 'Product',
  'type.website': 'Website',
  'type.school': 'Schoolproject',
  'work.title': 'Werk',
  'work.description': 'Alle projecten van Stefan: frameworks, producten, websites en schoolprojecten.',
  'work.heading': 'Werk',
  'work.lead': 'Van eigen frameworks tot websites voor klanten.',
  'work.filterLabel': 'Filter op type',
  'work.filterAll': 'Alles',
  'work.count': 'Projecten: {n}',
  'project.process': 'Van probleem naar resultaat',
  'project.problem': 'Probleem',
  'project.approach': 'Aanpak',
  'project.result': 'Resultaat',
  'project.metrics': 'In cijfers',
  'project.details': 'Stack en links',
  'project.stack': 'Stack',
  'project.live': 'Bekijk live',
  'project.repo': 'Broncode',
  'project.design': 'Ontwerp',
  'project.npm': 'npm-pakket',
  'project.gallery': 'Beelden',
  'project.client': 'Klant',
  'blog.title': 'Blog',
  'blog.description': 'Artikelen van Stefan over webdevelopment, design en het bouwen van eigen tools.',
  'blog.heading': 'Blog',
  'blog.empty': 'Hier verschijnen binnenkort de eerste artikelen.',
  'post.back': 'Alle artikelen',
  'about.title': 'Over',
  'about.description': 'Over Stefan: ervaring, skills en wat ik bouw.',
  'about.heading': 'Over mij',
  'about.lead': 'Ik ben Stefan, frontend developer en designer. Ik studeer aan de Frontend Design & Development-opleiding van de HvA en bouw daarnaast mijn eigen tools.',
  'about.portrait': 'Portret van Stefan',
  'about.experience': 'Ervaring',
  'about.present': 'heden',
  'about.kind.werk': 'Werk',
  'about.kind.opleiding': 'Opleiding',
  'about.skills': 'Skills',
  'about.github': 'Recent op GitHub',
  'about.cv': 'Download mijn cv (pdf)',
  'contact.title': 'Contact',
  'contact.description': 'Neem contact op met Stefan voor een opdracht, samenwerking of vraag.',
  'contact.heading': 'Contact',
  'contact.lead': 'Een opdracht, een samenwerking of gewoon een vraag? Stuur me een bericht.',
  'contact.other': 'Of via',
  'form.name': 'Naam',
  'form.email': 'E-mailadres',
  'form.message': 'Bericht',
  'form.send': 'Versturen',
  'form.sending': 'Versturen…',
  'form.success': 'Bedankt! Je bericht is verstuurd.',
  'form.error': 'Versturen is mislukt. Probeer het later opnieuw of mail me direct.',
  'form.noJs': 'Het formulier werkt met JavaScript. Mail me anders direct:',
  'footer.text': 'Gebouwd met WaldJS, GSAP en Centaur CMS.',
  'notFound.title': 'Pagina niet gevonden',
  'notFound.body': 'Deze pagina bestaat niet (meer).',
  'notFound.back': 'Terug naar home'
} as const

export type MessageKey = keyof typeof nl

const en: Record<MessageKey, string> = {
  'nav.label': 'Main navigation',
  'nav.work': 'Work',
  'nav.blog': 'Blog',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'skip': 'Skip to content',
  'lang.switch': 'Nederlands',
  'home.title': 'Steefan — developer and designer',
  'home.description': 'Portfolio of Stefan: creator of WaldJS and Centaur CMS, frontend developer and designer.',
  'home.heading': 'I build my own tools.',
  'home.lead': 'Framework author, CMS builder and frontend developer.',
  'home.featured': 'Featured work',
  'home.empty': 'Projects will appear here soon.',
  'home.clients': 'Worked with',
  'status.available': 'Available:',
  'status.unavailable': 'Not available:',
  'home.other': 'Other work',
  'home.about': 'About me',
  'home.aboutText': "I'm Stefan, a frontend developer and designer. I build fast, accessible websites and the tools I make them with: my own framework and my own CMS.",
  'home.aboutLink': 'More about me',
  'home.blog': 'From the blog',
  'home.cta': "Let's talk?",
  'type.framework': 'Framework',
  'type.product': 'Product',
  'type.website': 'Website',
  'type.school': 'School project',
  'work.title': 'Work',
  'work.description': "All of Stefan's projects: frameworks, products, websites and school projects.",
  'work.heading': 'Work',
  'work.lead': 'From my own frameworks to websites for clients.',
  'work.filterLabel': 'Filter by type',
  'work.filterAll': 'All',
  'work.count': 'Projects: {n}',
  'project.process': 'From problem to result',
  'project.problem': 'Problem',
  'project.approach': 'Approach',
  'project.result': 'Result',
  'project.metrics': 'In numbers',
  'project.details': 'Stack and links',
  'project.stack': 'Stack',
  'project.live': 'View live',
  'project.repo': 'Source code',
  'project.design': 'Design',
  'project.npm': 'npm package',
  'project.gallery': 'Images',
  'project.client': 'Client',
  'blog.title': 'Blog',
  'blog.description': 'Articles by Stefan about web development, design and building your own tools.',
  'blog.heading': 'Blog',
  'blog.empty': 'The first articles will appear here soon.',
  'post.back': 'All articles',
  'about.title': 'About',
  'about.description': 'About Stefan: experience, skills and what I build.',
  'about.heading': 'About me',
  'about.lead': "I'm Stefan, a frontend developer and designer. I study Frontend Design & Development at the Amsterdam University of Applied Sciences and build my own tools on the side.",
  'about.portrait': 'Portrait of Stefan',
  'about.experience': 'Experience',
  'about.present': 'present',
  'about.kind.werk': 'Work',
  'about.kind.opleiding': 'Education',
  'about.skills': 'Skills',
  'about.github': 'Recently on GitHub',
  'about.cv': 'Download my CV (pdf)',
  'contact.title': 'Contact',
  'contact.description': 'Get in touch with Stefan about a project, collaboration or question.',
  'contact.heading': 'Contact',
  'contact.lead': 'A project, a collaboration or just a question? Send me a message.',
  'contact.other': 'Or via',
  'form.name': 'Name',
  'form.email': 'Email address',
  'form.message': 'Message',
  'form.send': 'Send',
  'form.sending': 'Sending…',
  'form.success': 'Thanks! Your message has been sent.',
  'form.error': 'Sending failed. Please try again later or email me directly.',
  'form.noJs': 'The form needs JavaScript. Otherwise email me directly:',
  'footer.text': 'Built with WaldJS, GSAP and Centaur CMS.',
  'notFound.title': 'Page not found',
  'notFound.body': 'This page does not exist (anymore).',
  'notFound.back': 'Back to home'
}

const MESSAGES: Record<Locale, Record<MessageKey, string>> = { nl, en }

export function t(key: MessageKey, locale: Locale): string {
  return MESSAGES[locale][key]
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
