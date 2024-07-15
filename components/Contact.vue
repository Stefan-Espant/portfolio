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
    title
    url
    icon {
      url
      width
      height
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

</script>

<template>
    <section>
    <div>
        <h2>Contact</h2>
        <div>
            <a v-for="socialLink in data.allSocialLinks" :key="socialLink.id" :href="socialLink.url" target="_blank">
                <img :src="socialLink.icon.url" :alt="socialLink.title" :width="socialLink.icon.width" :height="socialLink.icon.height" />
                {{ socialLink.title }}
            </a>
        </div>
        </div>
    </section>
</template>

<style scoped>
section {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
}

section div {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

form {
    width: 30vw;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
}

label {
    display: grid;
    grid-template-columns: 1fr;
    font-family: 'Germania One', Arial, Helvetica, sans-serif;
}

input,
textarea,
button,
a {
    background-color: #f8f8f8;
    border: 8px ridge #f8f8f8;
    border-radius: 8px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    padding: 0.5rem 1rem;
}

button,
a {
    width: max-content;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    gap: var(--unit-small);
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.4);
    mix-blend-mode: hard-light;
}

a:hover {
  background-color: rgba(15, 64, 236, 0.4);
  border: 8px ridge var(--color-primary-blue);
  color: #f8f8f8;
}

button {
    font-family: 'Germania One', Arial, Helvetica, sans-serif;
    font-size: var(--unit-default);
}

a img {
  width: 2rem;
  height: 2rem;
  aspect-ratio: 1/1;
  mix-blend-mode: initial;
  filter: drop-shadow(0px 4px 4px #525252);
}

@media (min-width: 40rem) {
    section {
        grid-template-columns: 1fr;
    }

    section div div {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    section div div a {
      width: auto;
    }

    section div div a:last-of-type {
      grid-column: 1/3;
    }
  }
</style>
