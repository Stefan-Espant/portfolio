<template>
	<div v-for="mainimage in data.allMainimages" :key="mainimage.id">
		<img
			:src="mainimage.image.url"
			:width="mainimage.image.width"
			:height="mainimage.image.height"
			:alt="mainimage.image.alt"
		/>
	</div>
</template>

<script setup>
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
</script>

<style scoped>
img {
	width: 20rem;
	height: 20rem;
	aspect-ratio: 1/1;
	object-fit: cover;
	display: block;
	border-radius: 16px;
}

@media (min-width: 40rem) {
	img {
		width: 25rem;
		height: 25rem;
	}
}
</style>
