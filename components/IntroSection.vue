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
	grid-auto-columns: 1fr;
}

section div:first-child {
	grid-area: 'title';
}

section .image {
	grid-area: 'image';
}

@media (min-width: 70rem) {
	section {
		display: grid;
		grid-template-areas: 'title image';
	}

	section div {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 98vh;
	}
}
</style>
