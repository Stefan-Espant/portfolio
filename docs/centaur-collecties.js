// Maakt de Centaur-collecties voor het portfolio aan (of trekt hun velden gelijk) volgens
// docs/centaur-collecties.md: projecten, blog, ervaring, skills, status en klanten.
//
// Gebruik: log in op het Centaur-dashboard (als Admin) in het project "portfolio-van-stefan",
// open de browserconsole (Chrome: Cmd+Option+J), plak dit hele bestand en druk op Enter.
// Het script gebruikt je bestaande dashboard-sessie (localStorage "centaur_token");
// je login gaat nergens anders heen dan naar de Centaur-API.
//
// Veilig:
// - Per collectie eerst een bevestigingsvraag; zonder OK verandert er niets.
// - Bestaande velden met dezelfde slug behouden hun ID en worden bijgewerkt.
// - Velden die niet in deze lijst staan blijven bestaan (achteraan); er wordt niets verwijderd.

(async () => {
  const API = 'https://api.centaur-cms.app'
  const token = localStorage.getItem('centaur_token')
  if (!token) return console.error('Niet ingelogd: log eerst in op het Centaur-dashboard en probeer opnieuw.')

  const call = async (method, path, body) => {
    const response = await fetch(API + path, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      const error = new Error(`${method} ${path} → ${response.status}: ${JSON.stringify(data)}`)
      error.status = response.status
      throw error
    }
    return data
  }

  const id = () => crypto.randomUUID()
  const field = (name, slug, type, { required = false, config = {} } = {}) => ({ id: id(), name, slug, type, required, config })

  // Elke collectie is tweetalig: één entry per taal, gekoppeld via translation_key.
  const localized = () => [
    field('Taal (nl of en)', 'locale', 'text', { required: true }),
    field('Vertaalsleutel', 'translation_key', 'text', { required: true })
  ]

  const collections = [
    {
      name: 'Projecten',
      slug: 'projecten',
      fields: [
        ...localized(),
        field('Titel', 'title', 'text', { required: true }),
        field('Slug', 'slug', 'text', { required: true }),
        field('Samenvatting', 'summary', 'text'),
        field('Type (framework, product, website of school)', 'type', 'text'),
        field('Uitgelicht', 'featured', 'boolean'),
        field('Volgorde', 'order', 'number'),
        field('Jaar', 'year', 'number'),
        field('Klant', 'client', 'text'),
        field('Stack (komma-gescheiden)', 'stack', 'text'),
        field('Cover', 'cover', 'media'),
        field('Alt-tekst cover', 'cover_alt', 'text'),
        field('Probleem', 'problem', 'richtext'),
        field('Aanpak', 'approach', 'richtext'),
        field('Resultaat', 'result', 'richtext'),
        field('Cijfers (per regel "Label: waarde")', 'metrics', 'text'),
        field('Galerij', 'gallery', 'repeater', { config: { sub_fields: [
          field('Afbeelding', 'image', 'media', { required: true }),
          field('Alt-tekst', 'alt', 'text')
        ] } }),
        field('Live-URL', 'live_url', 'text'),
        field('Repo-URL', 'repo_url', 'text'),
        field('Ontwerp-URL', 'design_url', 'text'),
        field('npm-pakket', 'npm_package', 'text')
      ]
    },
    {
      name: 'Blog',
      slug: 'blog',
      fields: [
        ...localized(),
        field('Titel', 'title', 'text', { required: true }),
        field('Slug', 'slug', 'text', { required: true }),
        field('Intro', 'excerpt', 'text'),
        field('Tekst', 'body', 'richtext', { required: true }),
        field('Cover', 'cover', 'media'),
        field('Alt-tekst cover', 'cover_alt', 'text'),
        field('Publicatiedatum', 'published_at', 'date', { required: true }),
        field('Tags (komma-gescheiden)', 'tags', 'text')
      ]
    },
    {
      name: 'Ervaring',
      slug: 'ervaring',
      fields: [
        ...localized(),
        field('Rol', 'role', 'text', { required: true }),
        field('Organisatie', 'organisation', 'text'),
        field('Start', 'start', 'date', { required: true }),
        field('Einde (leeg = heden)', 'end', 'date'),
        field('Omschrijving', 'description', 'richtext'),
        field('Soort (werk of opleiding)', 'kind', 'text')
      ]
    },
    {
      name: 'Skills',
      slug: 'skills',
      fields: [
        ...localized(),
        field('Naam', 'name', 'text', { required: true }),
        field('Categorie', 'category', 'text'),
        field('Volgorde', 'order', 'number')
      ]
    },
    {
      name: 'Status',
      slug: 'status',
      fields: [
        ...localized(),
        field('Beschikbaar voor opdrachten', 'available', 'boolean'),
        field('Tekst (bv. "Beschikbaar vanaf januari")', 'text', 'text', { required: true })
      ]
    },
    {
      name: 'Klanten',
      slug: 'klanten',
      fields: [
        ...localized(),
        field('Naam', 'name', 'text', { required: true }),
        field('Logo', 'logo', 'media'),
        field('Website', 'url', 'text'),
        field('Quote', 'quote', 'text'),
        field('Auteur van de quote', 'quote_author', 'text'),
        field('Volgorde', 'order', 'number')
      ]
    }
  ]

  for (const collection of collections) {
    let current = null
    try {
      current = await call('GET', `/api/admin/collections/${collection.slug}`)
    } catch (error) {
      if (error.status !== 404) throw error
    }

    if (!current) {
      const summary = `Collectie "${collection.slug}" aanmaken met ${collection.fields.length} velden?\n\n${collection.fields.map(f => f.slug).join(', ')}`
      console.log(summary)
      if (!confirm(summary)) { console.log(`"${collection.slug}" overgeslagen.`); continue }
      const created = await call('POST', '/api/admin/collections', collection)
      console.log(`✔ "${created.slug}" aangemaakt met ${created.fields.length} velden.`)
      continue
    }

    const bySlug = new Map(current.fields.map(f => [f.slug, f]))
    const merged = collection.fields.map(f => (bySlug.has(f.slug) ? { ...f, id: bySlug.get(f.slug).id } : f))
    const extra = current.fields.filter(f => !collection.fields.some(d => d.slug === f.slug))
    const added = collection.fields.filter(f => !bySlug.has(f.slug)).map(f => f.slug)
    const summary =
      `Collectie "${collection.slug}" bestaat al. Velden bijwerken?\n\n` +
      `Nieuw (${added.length}): ${added.join(', ') || '—'}\n` +
      `Blijven ongewijzigd staan (${extra.length}): ${extra.map(f => f.slug).join(', ') || '—'}`
    console.log(summary)
    if (!confirm(summary)) { console.log(`"${collection.slug}" overgeslagen.`); continue }
    const result = await call('PUT', `/api/admin/collections/${collection.slug}`, { name: current.name, fields: [...merged, ...extra] })
    console.log(`✔ "${collection.slug}" heeft nu ${result.fields.length} velden.`)
  }
  console.log('Klaar. Controleer de collecties in het dashboard onder Collecties.')
})().catch(error => console.error('✖ Mislukt:', error.message))
