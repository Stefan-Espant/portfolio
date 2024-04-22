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
        <h3>Stuur mij een bericht</h3>
        <form method="post">
            <label>
                Naam
                <input />
            </label>

            <label>
                E-mail
                <input />
            </label>

            <label>
                Telefoon
                <input />
            </label>

            <label>
                Bericht
                <textarea />
            </label>

            <button type="submit">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_33_423)">
                        <g style="mix-blend-mode: color-burn">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M22.1834 7.69528L6.25116 13.4486L13.0371 16.8416L22.1834 7.69528ZM15.1584 18.9629L18.5514 25.7489L24.3048 9.81654L15.1584 18.9629ZM29.3995 4.54084L20.7441 28.5095C20.73 28.5486 20.7143 28.5871 20.6969 28.6249C20.5188 29.0137 20.2328 29.3432 19.8728 29.5741C19.5129 29.8051 19.0943 29.9279 18.6666 29.9279C18.239 29.9279 17.8203 29.8051 17.4604 29.5741C17.1096 29.349 16.829 29.0303 16.65 28.6543L12.2153 19.7847L3.34574 15.35C2.96973 15.171 2.65103 14.8904 2.42589 14.5396C2.19492 14.1797 2.07214 13.761 2.07214 13.3334C2.07214 12.9057 2.19492 12.4871 2.42589 12.1272C2.65686 11.7673 2.98631 11.4812 3.37507 11.3031C3.41288 11.2857 3.45139 11.27 3.4905 11.2559L27.4574 2.60116C27.9945 2.39318 28.6272 2.5059 29.0606 2.93934C29.3322 3.21093 29.4779 3.56076 29.4977 3.91628C29.5022 3.997 29.5002 4.07832 29.4915 4.15944C29.4777 4.28922 29.4471 4.41754 29.3995 4.54084Z"
                                fill="#001F01" />
                        </g>
                    </g>
                    <defs>
                        <clipPath id="clip0_33_423">
                            <rect width="32" height="32" fill="white" />
                        </clipPath>
                    </defs>
                </svg>

                verzenden
            </button>
        </form>
    </div>
    <div>
        <h3>Of volg mij op deze platformen</h3>
        <div v-for="socialLink in data.allSocialLinks" :key="socialLink.id">
            <a :href="socialLink.url" target="_blank">
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
