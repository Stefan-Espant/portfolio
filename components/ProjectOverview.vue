<template>
    <div>
        <section>
            <article v-for="project in data.allProjects" v-bind:key="project.id">
                <picture>
                    <!-- Gebruik project.image[0] om het eerste item te selecteren -->
                    <source v-if="project.image && project.image.length > 0" :srcset="project.image[0].srcSet" type="image/jpeg" />
                    <img v-if="project.image && project.image.length > 0" :src="project.image[0].url" :alt="project.image[0].alt" width="320" />
                </picture>

                <div>
                    <h4>{{ project.heading }}</h4>
                    <p>{{ project.client }}</p>
                    <p>{{ project.date }}</p>
                    <a v-if="project.url" :href="project.url">Bekijk de website</a>
                    <a v-if="project.urlDesign" :href="project.urlDesign">Bekijk het design</a>
                </div>
            </article>
        </section>
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
    }
  }
  allProjects {
    image {
      width
      height
      url
      title
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
	body: JSON.stringify({
		query: QUERY
	}),
	transform: ({ data, errors }) => {
		if (errors) throw new errors();
		return data;
	}
});

if (error) {
	console.error('GraphQL error:', error);
} else {
	console.log('GraphQL data:', data);
}

definePageMeta({
	layout: 'default'
});

</script>

<style scoped>
h4 {
    font-size: 2rem;
    color: var(--color-default-100);
    mix-blend-mode: color-burn;
}

section {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--unit-default);
}

article {
    min-width: 20rem;
    background-color: rgba(255, 255, 255, 0.4);
	border: 8px ridge var(--color-default-0);
    border-radius: var(--unit-small);
    padding: var(--unit-small);
    box-shadow: var(--shadow-default);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

article img {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: contain;
    border-radius: var(--unit-small);
}

a:hover {
	color: #f8f8f8;
	background-color: #0f40ec;
	@supports (background-color: oklch(48.23% 0.258 264.52)) {
		background-color: oklch(48.23% 0.258 264.52);
	}
}

article div:last-of-type {
    min-height: 12rem;
}

@media (min-width: 50rem) {
    section {
        display: grid;
        grid-template-columns: 1fr 1fr;
    } 
}

@media (min-width: 70rem) {
    section {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
    } 
}
</style>
