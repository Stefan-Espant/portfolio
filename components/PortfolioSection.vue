<template>
	<div>
		<section id="Portfolio">
			<h2>Portfolio</h2>
			<h3>Bekijk mijn Github projecten</h3>
			<GithubOverview :githubData="githubData" />

			<MediaVormgeving />

			<EspantDesign />
		</section>
	</div>
</template>

<script></script>

<style scoped>
section {
	padding: 1rem;
	height: fit-content;
}

h2,
h3 {
	color: var(--color-primary-blue);
}
</style>
