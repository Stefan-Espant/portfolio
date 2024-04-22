<template>
	<div>
		<section id="Portfolio">
			<h2>Portfolio</h2>
			<h3>Bekijk mijn Github projecten</h3>
			<GithubOverview :githubData="githubData" />
		</section>
	</div>
</template>

<script></script>

<style scoped>
section {
	padding: 1rem;
}

h2,
h3 {
	color: var(--color-primary-red);
}
</style>
