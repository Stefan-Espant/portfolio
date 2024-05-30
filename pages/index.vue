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
      responsiveImage(imgixParams: { fit: crop, w: 300, h: 300, auto: format }) {
        width
        height
        src
        alt
        webpSrcSet
      }
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
