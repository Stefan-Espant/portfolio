<template>
	<div>
		<slot :data="data" :githubData="githubData" />
	</div>
</template>

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

<style scoped></style>
