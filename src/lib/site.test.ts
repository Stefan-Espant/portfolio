import { afterEach, expect, test } from 'vitest'
import { absoluteUrl, siteUrl } from './site'

afterEach(() => {
  delete process.env.SITE_URL
  delete process.env.VERCEL_PROJECT_PRODUCTION_URL
})

test('siteUrl gebruikt SITE_URL, anders het Vercel-productiedomein', () => {
  process.env.SITE_URL = 'https://steefan.nl/'
  expect(siteUrl()).toBe('https://steefan.nl')
  delete process.env.SITE_URL
  process.env.VERCEL_PROJECT_PRODUCTION_URL = 'steefan.vercel.app'
  expect(siteUrl()).toBe('https://steefan.vercel.app')
})

test('absoluteUrl maakt alleen paden absoluut', () => {
  process.env.SITE_URL = 'https://steefan.nl'
  expect(absoluteUrl('/werk')).toBe('https://steefan.nl/werk')
  expect(absoluteUrl('https://cdn.example/a.png')).toBe('https://cdn.example/a.png')
})
