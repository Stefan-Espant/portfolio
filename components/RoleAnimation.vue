<template>
	<div>
		<h1>
			<span hidden> Tot uw dienst als </span>
			<div>
				<div>Frontend Ontwikkelaar</div>
				<span hidden>, </span>
				<div>Web ontwerper</div>
				<span hidden> en </span>
				<div>Grafisch vormgever</div>
			</div>
		</h1>
	</div>
</template>

<style scoped>
h1 {
	color: var(--color-primary-red);
	line-height: 1;
}

h1 div {
		width: 20rem;
		height: 7.5rem;
		position: relative;
	}

	h1 div div {
		position: absolute;
		transform: translateX(-80rem);
	}

	h1 div div:nth-of-type(1) {
		animation: slide-in 10s cubic-bezier(0.075, 0.82, 0.165, 1) infinite;
	}

	h1 div div:nth-of-type(2) {
		animation: slide-in 10s calc(10s / 3) cubic-bezier(0.075, 0.82, 0.165, 1) infinite;
	}

	h1 div div:nth-of-type(3) {
		animation: slide-in 10s calc(10s / 3 * 2) cubic-bezier(0.075, 0.82, 0.165, 1) infinite;
	}

@media (min-width: 40rem) {
	h1 {
		text-align: right;
		font-size: 4rem;
	}

	h1 div {
		width: 40rem;
		position: relative;
	}
}

@media (min-width: 60rem) {
	h1 {
		font-size: 7.5rem;
		line-height: 7.2rem;
	}
}

@keyframes slide-in {
	0% {
		transform: translateX(-80rem);
	}

	3% {
		transform: translateX(0rem);
	}

	30% {
		transform: translateX(0rem);
	}

	33% {
		transform: translateX(-80rem);
	}
}
</style>
