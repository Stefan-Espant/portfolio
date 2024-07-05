export default defineNuxtConfig({
	runtimeConfig: {
		public: {
			datoCmsToken: process.env.DATO_CMS_TOKEN,
			githubToken: process.env.GITHUB_TOKEN
		}
	},
	app: {
		head: {
			htmlAttrs: {
				lang: 'nl'
			},
			title: 'Portfolio van Stefan',
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1',
			link: [
				{ rel: "icon", type: "image/png", href: "/assets/images/favicon.png" }
			  ]
		},
	},
	nitro: {
		static: true,
	  },
});
