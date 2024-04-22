<template>
	<div>
		<NuxtLayout>
			<NuxtPage :data="data" />
		</NuxtLayout>
	</div>
</template>

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
  mainimage {
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
  aboutme {
    id
    age
    paragraph
    based {
      latitude
      longitude
    }
  }
  allSocialLinks {
    id
    title
    url
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
	const accessToken = `Bearer  process.env.GITHUB_TOKEN`;
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

<style scoped></style>
