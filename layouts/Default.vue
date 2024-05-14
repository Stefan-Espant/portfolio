<script>
// Import the global stylesheet
import './assets/styles/global.css';

</script>

<template>
	<div>
		<header>
			<MainLogo />
			<nav>
				<MainNavigation />
			</nav>
		</header>
		<main>
			<!-- Main sectie -->
			<IntroSection :data="data" />

			<!-- <QuoteBar {{ data.quotes }} /> -->
			<!-- Portfolio sectie -->
			<PortfolioSection />

			<!-- Over mij sectie -->
			<AboutMeSection :data="data" />

			<!-- Contact sectie -->
			<Contact :data="data" />
		</main>

		<StoneBackground />
	</div>
</template>

<style scoped>
header {
	display: grid;
	grid-template-columns: auto 220px;
	position: relative;
}

div {
	padding: 1rem;
}

@media (min-width: 60rem) {
	header {
		height: 2vh;
		display: flex;
		justify-content: space-between;
	}
}
</style>
