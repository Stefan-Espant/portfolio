<template>
	<div>
	  <picture>
		<!-- .webp versies van de Stefan afbeeldingen -->
		<source srcset="/assets/images/stefan/webp/stefan-200.webp 200w" media="(max-width: 200px)" type="image/webp" />
		<source srcset="/assets/images/stefan/webp/stefan-299.webp 299w" media="(max-width: 299px)" type="image/webp" />
		<source srcset="/assets/images/stefan/webp/stefan-376.webp 376w" media="(max-width: 376px)" type="image/webp" />

		<!-- .png versies van de Stefan afbeeldingen -->
		<source srcset="/assets/images/stefan/png/stefan-200.png 200w" media="(max-width: 200px)" type="image/png" />
		<source srcset="/assets/images/stefan/png/stefan-299.png 299w" media="(max-width: 299px)" type="image/png" />
		<source srcset="/assets/images/stefan/png/stefan-376.png 376w" media="(max-width: 376px)" type="image/png" />

		<!-- Fallback afbeelding voor browsers die <picture> niet ondersteunen -->
		<img
		  src="/assets/images/stefan/webp/stefan-376.webp"
		  alt="Hoofdfoto van Stefan"
		  width="376"
		  height="376"
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
