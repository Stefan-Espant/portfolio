<script setup>
import axios from 'axios';

const QUERY = `
{
  _allRolesMeta {
    count
  }
  allRoles {
    id
    roleTitle
    _status
    _firstPublishedAt
  }
  allMainimages {
    id
    image {
      url
      width
      height
      size
      alt
    }
  }
  allQuotes {
    id
    message
    author
  }
}
`;

const runtimeConfig = useRuntimeConfig();

// Functie om DatoCMS-gegevens op te halen
const getDatoCmsData = async () => {
	const { data, error } = await useFetch('https://graphql.datocms.com', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${runtimeConfig.public.datoCmsToken}`
		},
		body: {
			query: QUERY
		},
		transform: ({ data, errors }) => {
			if (errors) throw new errors();

			return data;
		}
	});

	return data;
};

// Functie om GitHub-gegevens op te halen met back-off-strategie
const getGitHubData = async () => {
	const accessToken = `Bearer process.env.GITHUB_TOKEN`;
	const url = 'https://api.github.com/users/stefan-espant';

	const makeGitHubRequest = async () => {
		try {
			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			if (response.status === 200) {
				return response.data;
			} else {
				console.error(`GitHub API request failed with status code ${response.status}`);
				return null;
			}
		} catch (error) {
			if (error.response && error.response.status === 403) {
				// Implementeer een back-off-strategie
				const waitTime = 2000; // wacht 2 seconden
				console.log(`Rate limit exceeded. Waiting for ${waitTime / 1000} seconds before retrying.`);
				await new Promise((resolve) => setTimeout(resolve, waitTime));
				return makeGitHubRequest(); // probeer het opnieuw na de wachttijd
			} else {
				console.error('An unexpected error occurred:', error.message);
				return null;
			}
		}
	};

	return await makeGitHubRequest();
};

// Wacht tot beide datasets beschikbaar zijn
const [datoCmsData, githubData] = await Promise.all([getDatoCmsData(), getGitHubData()]);

definePageMeta({
	layout: 'default'
});
</script>

<template>
	<div>
		<pre>{{ githubData }}</pre>
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
					</p>
					<p>{{ githubData }}</p>
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
						<!-- <p>{{ githubData.public_repos }}</p> -->
						<span>15</span>
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
						<!-- <p>{{ githubData.public_repos }}</p> -->
						<span>15</span>
					</p>
				</div>
			</div>
			<article class="github-repo-overview">
				<article>
					<div>
						<h4>Alweer</h4>
						<p>De weerapp voor de browser</p>
					</div>
					<ul>
						<li>
							<svg
								width="32"
								height="32"
								viewBox="0 0 32 32"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<g style="mix-blend-mode: color-burn" clip-path="url(#clip0_23_95)">
									<path
										d="M16 23.6666L7.77069 27.9933L9.34269 18.8293L2.67603 12.34L11.876 11.0066L15.9907 2.66931L20.1054 11.0066L29.3054 12.34L22.6387 18.8293L24.2107 27.9933L16 23.6666Z"
										stroke="#730F01"
										stroke-width="4"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</g>
								<defs>
									<clipPath id="clip0_23_95">
										<rect width="32" height="32" fill="white" />
									</clipPath>
								</defs>
							</svg>
							Sterren:
						</li>
						<li>
							<svg
								width="32"
								height="32"
								viewBox="0 0 32 32"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<g style="mix-blend-mode: color-burn" clip-path="url(#clip0_23_111)">
									<path
										d="M16 18C17.1046 18 18 17.1046 18 16C18 14.8954 17.1046 14 16 14C14.8954 14 14 14.8954 14 16C14 17.1046 14.8954 18 16 18Z"
										fill="#730F01"
										stroke="#730F01"
										stroke-width="4"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M4 16C4 17.5759 4.31039 19.1363 4.91345 20.5922C5.5165 22.0481 6.40042 23.371 7.51472 24.4853C8.62902 25.5996 9.95189 26.4835 11.4078 27.0866C12.8637 27.6896 14.4241 28 16 28C17.5759 28 19.1363 27.6896 20.5922 27.0866C22.0481 26.4835 23.371 25.5996 24.4853 24.4853C25.5996 23.371 26.4835 22.0481 27.0866 20.5922C27.6896 19.1363 28 17.5759 28 16C28 14.4241 27.6896 12.8637 27.0866 11.4078C26.4835 9.95189 25.5996 8.62902 24.4853 7.51472C23.371 6.40042 22.0481 5.5165 20.5922 4.91345C19.1363 4.31039 17.5759 4 16 4C14.4241 4 12.8637 4.31039 11.4078 4.91345C9.95189 5.5165 8.62902 6.40042 7.51472 7.51472C6.40042 8.62902 5.5165 9.95189 4.91345 11.4078C4.31039 12.8637 4 14.4241 4 16Z"
										stroke="#730F01"
										stroke-width="4"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</g>
								<defs>
									<clipPath id="clip0_23_111">
										<rect width="32" height="32" fill="white" />
									</clipPath>
								</defs>
							</svg>
							Openstaande issues:
						</li>
						<li>
							<svg
								width="32"
								height="32"
								viewBox="0 0 32 32"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<g style="mix-blend-mode: color-burn" clip-path="url(#clip0_23_122)">
									<path
										d="M9.33333 10.6667L4 16L9.33333 21.3334"
										stroke="#730F01"
										stroke-width="4"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M22.6667 10.6667L28 16L22.6667 21.3334"
										stroke="#730F01"
										stroke-width="4"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M18.6666 5.33331L13.3333 26.6666"
										stroke="#730F01"
										stroke-width="4"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</g>
								<defs>
									<clipPath id="clip0_23_122">
										<rect width="32" height="32" fill="white" />
									</clipPath>
								</defs>
							</svg>
							<p>
								<span>html</span><span>css</span><span>javascript</span><span>ejs</span
								><span>express</span><span>nodejs</span>
							</p>
						</li>
					</ul>
				</article>
			</article>
		</section>
	</div>
</template>

<style scoped>
section .github-info {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	padding: 2rem;
}

.github-info div {
	width: 33vw;
}

.github-info div p {
	height: fit-content;
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 8px;
	font-size: 2rem;
}

/* Github repository overzicht */
.github-repo-overview {
	display: grid;
	grid-template-areas: 1fr 1fr 1fr;
}

.github-repo-overview article {
	width: 33vw;
	border: 2px solid var(--color-default-70);
	border-radius: var(--unit-default);
	padding: var(--unit-small);
	display: grid;
	grid-template-columns: 1fr;
}

.github-repo-overview article h4 {
	font-family: 'Germania one';
	font-size: calc(1rem * 3);
	color: var(--color-primary-red);
	mix-blend-mode: color-burn;
}
.github-repo-overview article ul {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

.github-repo-overview article ul li:nth-of-type(1) {
	width: 40%;
}

.github-repo-overview article ul li:nth-of-type(2) {
	width: 50%;
}

.github-repo-overview article ul li:last-child {
	width: 100%;
	display: grid;
	grid-template-columns: 32px 1fr;
	gap: 8px;
	flex-wrap: wrap;
}

.github-repo-overview article ul li p {
	display: flex;
	gap: 8px;
}

.github-repo-overview article ul li p span {
	width: fit-content;
	background-color: var(--color-default-90);
	color: var(--color-default-0);
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	mix-blend-mode: color-burn;
}
</style>
