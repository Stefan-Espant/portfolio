import { describe, expect, test } from 'vitest'
import { LOCALES, MESSAGE_KEYS, accent, formatDate, formatMonth, isLocale, langSwitchHref, localePath, otherLocale, plain, t } from './i18n'

describe('i18n', () => {
  test('ondersteunt nl en en', () => {
    expect(LOCALES).toEqual(['nl', 'en'])
    expect(isLocale('nl')).toBe(true)
    expect(isLocale('de')).toBe(false)
    expect(isLocale(undefined)).toBe(false)
    expect(otherLocale('nl')).toBe('en')
    expect(otherLocale('en')).toBe('nl')
  })

  test('localePath geeft NL zonder prefix en EN onder /en', () => {
    expect(localePath('home', 'nl')).toBe('/')
    expect(localePath('home', 'en')).toBe('/en')
    expect(localePath('work', 'nl')).toBe('/werk')
    expect(localePath('work', 'en')).toBe('/en/work')
    expect(localePath('about', 'nl')).toBe('/over')
    expect(localePath('about', 'en')).toBe('/en/about')
    expect(localePath('contact', 'en')).toBe('/en/contact')
  })

  test('localePath vult de slug in bij detailroutes', () => {
    expect(localePath('project', 'nl', 'waldjs')).toBe('/werk/waldjs')
    expect(localePath('project', 'en', 'waldjs')).toBe('/en/work/waldjs')
    expect(localePath('post', 'nl', 'mijn-post')).toBe('/blog/mijn-post')
    expect(localePath('post', 'en', 'my-post')).toBe('/en/blog/my-post')
  })

  test('localePath gooit als een detailroute geen slug krijgt', () => {
    expect(() => localePath('project', 'nl')).toThrow('Route "project" heeft een slug nodig')
  })

  test('t vertaalt per taal', () => {
    expect(t('nav.work', 'nl')).toBe('Werk')
    expect(t('nav.work', 'en')).toBe('Work')
  })

  test('langSwitchHref linkt naar de vertaling, of naar de home van de andere taal', () => {
    expect(langSwitchHref({ nl: '/werk/waldjs', en: '/en/work/waldjs' }, 'nl')).toBe('/en/work/waldjs')
    expect(langSwitchHref({ nl: '/blog/alleen-nl' }, 'nl')).toBe('/en')
    expect(langSwitchHref({}, 'en')).toBe('/')
  })

  test('formatDate en formatMonth per taal', () => {
    expect(formatDate('2024-05-01', 'nl')).toBe('1 mei 2024')
    expect(formatDate('2024-05-01', 'en')).toBe('1 May 2024')
    expect(formatMonth('2023-09-01', 'nl')).toBe('sep 2023')
    expect(formatMonth('2023-09-01', 'en')).toBe('Sept 2023')
    expect(formatDate('', 'nl')).toBe('')
    expect(formatDate('geen datum', 'nl')).toBe('')
  })

  test('datums met tijdzone of zonder offset schuiven niet van dag', () => {
    expect(formatDate('2024-05-01T00:30:00+02:00', 'en')).toBe('1 May 2024')
    expect(formatDate('2024-05-01T00:00:00', 'nl')).toBe('1 mei 2024')
    expect(formatMonth('2023-09-15T23:59:00-05:00', 'nl')).toBe('sep 2023')
  })

  test('nieuwe teksten bestaan in beide talen', () => {
    expect(t('work.heading', 'nl')).toBe('Mijn *werk*')
    expect(t('work.heading', 'en')).toBe('My *work*')
    expect(t('type.framework', 'en')).toBe('Framework')
  })
})

describe('accent en plain', () => {
  test('maakt van *woorden* een <em> en escapet de rest', () => {
    expect(accent('Eerder *werk*')).toBe('Eerder <em>werk</em>')
    expect(accent('Snel, *van framework tot frontend.*')).toBe('Snel, <em>van framework tot frontend.</em>')
    expect(accent('<b>&"\'</b> *x*')).toBe('&lt;b&gt;&amp;&quot;&#39;&lt;/b&gt; <em>x</em>')
    expect(accent('Zonder accent')).toBe('Zonder accent')
  })
  test('plain haalt de sterretjes weg voor titels en labels', () => {
    expect(plain('Laten we iets *bouwen.*')).toBe('Laten we iets bouwen.')
    expect(plain('Geen sterretjes')).toBe('Geen sterretjes')
  })
  test('elke vertaling heeft evenveel accenten als de Nederlandse tekst', () => {
    for (const key of MESSAGE_KEYS) {
      const count = (text: string) => (text.match(/\*/g) ?? []).length
      expect(count(t(key, 'en')), key).toBe(count(t(key, 'nl')))
    }
  })
})
