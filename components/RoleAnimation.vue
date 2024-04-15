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

<script></script>

<style scoped>
h1 {
	color: var(--color-primary-red);
	line-height: 1;
}

@media (min-width: 40rem) {
	h1 {
		text-align: right;
		font-size: 7.5rem;
	}

	h1 div {
		width: 44rem;
		height: 15rem;
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
