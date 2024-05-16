export default defineNuxtConfig({
	runtimeConfig: {
		public: {
			datoCmsToken: process.env.DATO_CMS_TOKEN,
			githubToken: process.env.GITHUB_TOKEN
		}
	},
	routeRules: {
		'/**': { isr: 60 },
		'/static': { isr: true },
		'/prerendered': { prerender: true },
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
