<template>
	<div v-for="mainimage in data.allMainimages" :key="mainimage.id">
		<picture>
			<source :srcset="mainimage.image.responsiveImage.webpSrcSet" type="image/webp" />
			<source :srcset="mainimage.image.responsiveImage.srcSet" type="image/png" />
			<img
				:src="mainimage.image.responsiveImage.src"
				:width="mainimage.image.responsiveImage.width"
				:height="mainimage.image.responsiveImage.height"
				:alt="mainimage.image.responsiveImage.alt"
			/>
		</picture>
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
      responsiveImage(imgixParams: { fit: crop, w: 300, h: 300, auto: format }) {
        src
        width
        height
        alt
        webpSrcSet
        srcSet
      }
    }
  }
  allQuotes {
    id
    message
    author
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

<style scoped>
img {
	width: 20rem;
	height: 20rem;
	margin: auto;
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

@media (min-width: 60rem) {
	img {
		margin: 0;
	}
}
</style>
