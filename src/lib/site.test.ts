import { afterEach, expect, test } from 'vitest'
import { PRODUCTION_URL, absoluteUrl, siteUrl } from './site'

afterEach(() => {
  delete process.env.SITE_URL
  delete process.env.VERCEL
  delete process.env.VERCEL_PROJECT_PRODUCTION_URL
})

test('siteUrl gebruikt SITE_URL, anders op Vercel het vaste productiedomein, anders leeg', () => {
  process.env.SITE_URL = 'https://stefanvanderkort.nl/'
  expect(siteUrl()).toBe('https://stefanvanderkort.nl')
  delete process.env.SITE_URL
  expect(siteUrl()).toBe('')
  process.env.VERCEL = '1'
  process.env.VERCEL_PROJECT_PRODUCTION_URL = 'steefan.nl'
  expect(siteUrl()).toBe(PRODUCTION_URL)
})

test('absoluteUrl maakt alleen paden absoluut', () => {
  process.env.SITE_URL = 'https://stefanvanderkort.nl'
  expect(absoluteUrl('/werk')).toBe('https://stefanvanderkort.nl/werk')
  expect(absoluteUrl('https://cdn.example/a.png')).toBe('https://cdn.example/a.png')
})
