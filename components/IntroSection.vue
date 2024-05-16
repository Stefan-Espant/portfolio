<script setup></script>

<template>
	<section>
		<div>
			<!-- Text animatie -->
			<RoleAnimation />
		</div>
		<div>
			<!-- Hoofdafbeelding van mijapizelf -->
			<MainImage class="image" :data="data" />

			<!-- Contact link -->
		</div>
	</section>
</template>

<style scoped>
section {
	grid-template-columns: 1fr;
}

section div:first-child {
	grid-area: 'title';
}

section .image {
	grid-area: 'image';
}

@media (min-width: 60rem){
	section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin: 5rem 0;
	}
}

@media (min-width: 70rem) {
	section {
		grid-template-areas: 'title image';
		margin: 0;
	}

	section div {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 98vh;
	}
}
</style>
