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
