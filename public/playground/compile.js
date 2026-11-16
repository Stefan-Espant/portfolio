// Mini .wald-compiler voor de playground op de case study van WaldJS. Overgenomen uit de WaldJS-marketingsite
// (marketing/src/assets/js/site.js, MIT, © Stefan van der Kort) en hier als module met tests
// (tests/playground-compile.test.js). Bewust klein: frontmatter-variabelen en {expressies}, geen echte compiler.
// De bezoeker voert alleen eigen code uit in de eigen browser; het resultaat gaat naar een sandbox-iframe.

/** Zet een .wald-bron om in HTML: variabelen uit de frontmatter (tussen ---) gevuld in de {expressies}. */
export function compileWald(source) {
  let frontmatter = ''
  let template = source
  const parts = source.split(/^---\s*$/m)
  if (parts.length >= 3) {
    frontmatter = parts[1]
    template = parts.slice(2).join('---')
  }
  const vars = {}
  try {
    const code = frontmatter.replace(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g, 'vars.$1 =')
    new Function('vars', code)(vars)
  } catch (error) {
    return `<p class="pg-error">Frontmatter: ${escapeHtml(error.message)}</p>`
  }
  return template.replace(/\{([^{}]+)\}/g, (match, expression) => {
    try {
      return String(new Function('vars', `with (vars) { return (${expression}) }`)(vars))
    } catch {
      return `<code class="pg-error">{${escapeHtml(expression)}}</code>`
    }
  })
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char])
}
