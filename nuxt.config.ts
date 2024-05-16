export default defineNuxtConfig({
	runtimeConfig: {
		public: {
			datoCmsToken: process.env.DATO_CMS_TOKEN,
			githubToken: process.env.GITHUB_TOKEN
		}
	},
	routeRules: {
		// all routes (by default) will be revalidated every 60 seconds, in the background
		'/**': { isr: 60 },
		// this page will be generated on demand and then cached permanently
		'/static': { isr: true },
		// this page is statically generated at build time and cached permanently
		'/prerendered': { prerender: true },
		// this page will be always fresh
		'/dynamic': { isr: false },
	  },
	app: {
		head: {
			htmlAttrs: {
				lang: 'nl'
			},
			title: 'Portfolio van Stefan',
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1'
		}
	}
});
