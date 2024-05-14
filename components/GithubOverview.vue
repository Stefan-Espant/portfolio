<script>
export default {
	data() {
		return {
			githubData: []
		};
	},
	computed: {
		// Alleen repositories met ten minste één ster
		filteredRepositories() {
			return this.githubData.filter((repo) => repo.stargazers_count > 0);
		}
	},
	async created() {
		try {
			const response = await fetch('https://api.github.com/users/Stefan-Espant/repos');
			this.githubData = await response.json();
		} catch (error) {
			console.error('Error fetching GitHub repos:', error);
		}
	}
};
</script>

<template>
	<div>
		<section>
			<h3 hidden>Wat informatie over mijn github</h3>
			<div class="github-info">
				<div>
					<p>
						<svg
							width="32"
							height="32"
							viewBox="0 0 32 32"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g style="mix-blend-mode: color-burn" clip-path="url(#clip0_23_149)">
								<path
									d="M6.66667 5.33331H12L16 9.33331H25.3333C26.0406 9.33331 26.7189 9.61426 27.219 10.1144C27.719 10.6145 28 11.2927 28 12V22.6666C28 23.3739 27.719 24.0522 27.219 24.5523C26.7189 25.0524 26.0406 25.3333 25.3333 25.3333H6.66667C5.95942 25.3333 5.28115 25.0524 4.78105 24.5523C4.28095 24.0522 4 23.3739 4 22.6666V7.99998C4 7.29274 4.28095 6.61446 4.78105 6.11436C5.28115 5.61426 5.95942 5.33331 6.66667 5.33331Z"
									stroke="#730F01"
									stroke-width="4"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</g>
							<defs>
								<clipPath id="clip0_23_149">
									<rect width="32" height="32" fill="white" />
								</clipPath>
							</defs>
						</svg>
						repositories:
						<span>0</span>
					</p>
				</div>
				<div>
					<p>
						<svg
							width="32"
							height="32"
							viewBox="0 0 32 32"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g style="mix-blend-mode: color-burn" clip-path="url(#clip0_23_152)">
								<path
									d="M6.66666 9.33333C6.66666 10.7478 7.22856 12.1044 8.22875 13.1046C9.22895 14.1048 10.5855 14.6667 12 14.6667C13.4145 14.6667 14.771 14.1048 15.7712 13.1046C16.7714 12.1044 17.3333 10.7478 17.3333 9.33333C17.3333 7.91885 16.7714 6.56229 15.7712 5.5621C14.771 4.5619 13.4145 4 12 4C10.5855 4 9.22895 4.5619 8.22875 5.5621C7.22856 6.56229 6.66666 7.91885 6.66666 9.33333Z"
									stroke="#730F01"
									stroke-width="4"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M4 28V25.3333C4 23.9188 4.5619 22.5623 5.5621 21.5621C6.56229 20.5619 7.91885 20 9.33333 20H14.6667C16.0812 20 17.4377 20.5619 18.4379 21.5621C19.4381 22.5623 20 23.9188 20 25.3333V28"
									stroke="#730F01"
									stroke-width="4"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M21.3333 4.17334C22.4806 4.46707 23.4974 5.13427 24.2235 6.06975C24.9497 7.00523 25.3438 8.15578 25.3438 9.34001C25.3438 10.5242 24.9497 11.6748 24.2235 12.6103C23.4974 13.5457 22.4806 14.2129 21.3333 14.5067"
									stroke="#730F01"
									stroke-width="4"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M28 28V25.3333C27.9932 24.1562 27.5972 23.0144 26.8737 22.0859C26.1502 21.1574 25.1398 20.4943 24 20.2"
									stroke="#730F01"
									stroke-width="4"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</g>
							<defs>
								<clipPath id="clip0_23_152">
									<rect width="32" height="32" fill="white" />
								</clipPath>
							</defs>
						</svg>
						volgers:
						<span>{{ githubData.followers }}</span>
					</p>
				</div>
				<div>
					<p>
						<svg
							width="32"
							height="32"
							viewBox="0 0 32 32"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g style="mix-blend-mode: color-burn" clip-path="url(#clip0_23_158)">
								<path
									d="M10.6667 9.33333C10.6667 10.7478 11.2286 12.1044 12.2288 13.1046C13.229 14.1048 14.5855 14.6667 16 14.6667C17.4145 14.6667 18.771 14.1048 19.7712 13.1046C20.7714 12.1044 21.3333 10.7478 21.3333 9.33333C21.3333 7.91885 20.7714 6.56229 19.7712 5.5621C18.771 4.5619 17.4145 4 16 4C14.5855 4 13.229 4.5619 12.2288 5.5621C11.2286 6.56229 10.6667 7.91885 10.6667 9.33333Z"
									stroke="#730F01"
									stroke-width="4"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M8 28V25.3333C8 23.9188 8.5619 22.5623 9.5621 21.5621C10.5623 20.5619 11.9188 20 13.3333 20H18.6667C20.0812 20 21.4377 20.5619 22.4379 21.5621C23.4381 22.5623 24 23.9188 24 25.3333V28"
									stroke="#730F01"
									stroke-width="4"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</g>
							<defs>
								<clipPath id="clip0_23_158">
									<rect width="32" height="32" fill="white" />
								</clipPath>
							</defs>
						</svg>
						volgend:
						<span>15</span>
					</p>
				</div>
			</div>
			<div class="github-repo-overview">
				<article v-for="repo in filteredRepositories" :key="repo.id">
					<h4>{{ repo.name }}</h4>
					<p>{{ repo.description }}</p>
					<div>
						<!-- Aantal sterren als SVG-iconen -->
						<span>
							<svg
								v-for="star in repo.stargazers_count"
								:key="star"
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="icon icon-tabler icon-tabler-star"
							>
								<path
									d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"
								/>
							</svg>
						</span>
					</div>
					<div>
						<a :href="repo.html_url">Bezoek de repository</a>
						<a :href="repo.homepage" v-if="repo.homepage">Bezoek de website</a>
					</div>
					<!-- Topics weergeven -->
					<div>
						<span hidden>Topics:</span>
						<p v-for="topic in repo.topics" :key="topic">{{ topic }}</p>
					</div>
				</article>
			</div>
		</section>
	</div>
</template>

<style scoped>
</style>