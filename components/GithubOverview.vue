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

// Functie om GitHub-gegevens op te halen
const getGitHubData = async () => {
	try {
		const response = await axios.get('https://api.github.com/users/stefan-espant');
		return response.data;
	} catch (error) {
		console.error('Error fetching GitHub data:', error.response || error.message);
		throw error;
	}
};

// Wacht tot beide datasets beschikbaar zijn
const [datoCmsData, githubData] = await Promise.all([getDatoCmsData(), getGitHubData()]);

definePageMeta({
	layout: 'default'
});
</script>

<template>
	<div>
		<section>
			<h3 hidden>Wat informatie over mijn github</h3>
		</section>
	</div>
</template>

<style scoped></style>
