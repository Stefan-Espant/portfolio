<script setup>
// Import the global stylesheet
import '~/assets/styles/global.css';

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
}
`;

const runtimeConfig = useRuntimeConfig();
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

definePageMeta({
	layout: 'default'
});

console.log(data);
</script>

<template>
    <div>
        <h2 id="AboutMe">Over mij</h2>
        <h3>Wie is Stefan?</h3>
        <p>{{ data.aboutme.paragraph }}</p>
    </div>
</template>

<style scoped>
    p {
        max-width: 75ch;
    }
</style>