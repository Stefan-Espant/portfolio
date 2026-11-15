import { describe, expect, test } from 'vitest'
import { compileWald } from '../public/playground/compile.js'

describe('compileWald (mini .wald-compiler)', () => {
  test('vult variabelen uit de frontmatter in de template', () => {
    const html = compileWald('---\nconst titel = "Bos"\nconst soorten = ["eik", "beuk"]\n---\n<h1>{titel}</h1><p>{soorten.length} soorten</p>')
    expect(html).toBe('\n<h1>Bos</h1><p>2 soorten</p>')
  })
  test('ondersteunt map en join in expressies', () => {
    const html = compileWald('---\nconst xs = ["a", "b"]\n---\n<ul>{xs.map(x => "<li>" + x + "</li>").join("")}</ul>')
    expect(html).toBe('\n<ul><li>a</li><li>b</li></ul>')
  })
  test('zonder frontmatter blijft de template staan', () => {
    expect(compileWald('<p>Hallo</p>')).toBe('<p>Hallo</p>')
  })
  test('een fout in de frontmatter of een expressie wordt zichtbaar gemeld', () => {
    expect(compileWald('---\nconst = 1\n---\n<p>x</p>')).toContain('Frontmatter:')
    expect(compileWald('---\nconst a = 1\n---\n<p>{b.c}</p>')).toContain('<code class="pg-error">{b.c}</code>')
  })
})
