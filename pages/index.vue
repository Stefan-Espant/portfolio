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
  mainimage {
    id
    image {
      url
      width
      height
      size
      alt
      responsiveImage(imgixParams: {fit: crop, w: 300, h: 300, auto: format}) {
        width
        height
        src
        alt
        webpSrcSet
      }
    }
  }
  allProjects {
    image {
      width
      height
      url
      title
      responsiveImage {
        width
        src
        sizes
        height
        alt
        srcSet
        webpSrcSet
      }
      height
      alt
    }
    heading
    client
    date
    id
    url
    urlDesign
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

<style scoped></style>
