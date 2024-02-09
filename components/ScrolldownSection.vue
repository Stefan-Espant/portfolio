<template>
	<div>
		<section>
			<div>
				<svg
					width="32"
					height="32"
					viewBox="0 0 32 32"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g style="mix-blend-mode: color-burn" clip-path="url(#clip0_31_308)">
						<path
							d="M10.6667 16L16 21.3333L21.3333 16"
							stroke="#0F40EC"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M16 10.6667V21.3333"
							stroke="#0F40EC"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M16 4C25.6 4 28 6.4 28 16C28 25.6 25.6 28 16 28C6.4 28 4 25.6 4 16C4 6.4 6.4 4 16 4Z"
							stroke="#0F40EC"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</g>
					<defs>
						<clipPath id="clip0_31_308">
							<rect width="32" height="32" fill="white" />
						</clipPath>
					</defs>
				</svg>
				<p>scroll verder</p>
			</div>
		</section>
	</div>
</template>

<style scoped>
section {
	width: 100%;
	height: 1vh;
	position: relative;
	margin-top: auto;
}

section div {
	width: 100%;
	position: absolute;
	bottom: 1rem;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	gap: var(--unit-small);
	margin: auto;
	z-index: 1;
}

p {
	color: var(--color-primary-blue);
	mix-blend-mode: color-burn;
	font-size: 16px;
}

@keyframes flowding {
}
</style>
