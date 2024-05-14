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

console.log(data);
</script>

<template>
    <section>
    <div>
        <h2>Contact</h2>
        <h3>Volg mij op deze platformen</h3>
        <div>
            <a v-for="socialLink in data.allSocialLinks" :key="socialLink.id" :href="socialLink.url" target="_blank">
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
    gap: 1rem;;
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
    border: 2px solid #f8f8f8;
    border-radius: 8px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    padding: 0.5rem 1rem;
}

button,
a {
    cursor: pointer;
    display: flex;
    flex-direction: row;
    gap: var(--unit-small);
    justify-content: center;
    align-items: center;
}

button {
    font-family: 'Germania One', Arial, Helvetica, sans-serif;
    font-size: var(--unit-default);
}

@media (min-width: 40rem) {
    section {
        grid-template-columns: 1fr 1fr;
    }
}
</style>
