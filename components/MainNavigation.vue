<template>
	<div>
		<nav>
			<div class="dropdown-navigation">
				<details>
					<summary>
						<figure>
							<div>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<g clip-path="url(#clip0_937_7)">
										<path
											d="M4 8H20"
											stroke=""
											stroke-width="4"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M4 16H20"
											stroke=""
											stroke-width="4"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</g>
									<defs>
										<clipPath id="clip0_937_7">
											<rect width="24" height="24" fill="white" />
										</clipPath>
									</defs>
								</svg>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									class="svelte-1gdolbd"
								>
									<g clip-path="url(#clip0_937_18)" class="svelte-1gdolbd">
										<path
											d="M6 6L17.3137 17.3137"
											stroke=""
											stroke-width="4"
											stroke-linecap="round"
											stroke-linejoin="round"
											class="svelte-1gdolbd"
										></path>
										<path
											d="M6 17.3135L17.3137 5.99977"
											stroke=""
											stroke-width="4"
											stroke-linecap="round"
											stroke-linejoin="round"
											class="svelte-1gdolbd"
										></path>
									</g>
									<defs class="svelte-1gdolbd">
										<clipPath id="clip0_937_18" class="svelte-1gdolbd">
											<rect width="24" height="24" fill="white" class="svelte-1gdolbd"></rect>
										</clipPath>
									</defs>
								</svg>
							</div>
							<figcaption>menu</figcaption>
						</figure>
					</summary>
					<ul>
						<li>
							<a href="#Portfolio"> portfolio </a>
						</li>
						<li>
							<a href="#AboutMe"> wie is stefan </a>
						</li>
						<li>
							<a href="https://i-love-web-app-alpha.vercel.app/"> blog </a>
						</li>
						<li>
							<a href="#Contact"> contact </a>
						</li>
					</ul>
				</details>
			</div>
			<div class="inline-navigation">
				<ul>
					<li>
						<a href="#Portfolio"> portfolio </a>
					</li>
					<li>
						<a href="#AboutMe"> wie is stefan </a>
					</li>
					<li>
						<a href="https://i-love-web-app-alpha.vercel.app/"> blog </a>
					</li>
					<li>
						<a href="#Contact"> contact </a>
					</li>
				</ul>
			</div>
		</nav>
	</div>
</template>

<script></script>

<style scoped>
a,
summary {
	font-family: 'Germania One', Helvetica, Arial, sans-serif;
}

nav .dropdown-navigation ul {
	position: absolute;
}

li {
	padding: 0.5rem;
}

a {
	padding: 0.25rem 0.5rem;
	border-radius: var(--unit-micro);
	mix-blend-mode: color-burn;
}

a:hover {
	color: #f8f8f8;
	background-color: #0f40ec;
	@supports (background-color: oklch(48.23% 0.258 264.52)) {
		background-color: oklch(48.23% 0.258 264.52);
	}
}

summary::-webkit-details-marker {
	font-size: 0rem;
}

details figure svg:first-child {
	display: block;
}

details figure svg:last-child {
	display: none;
}

details[open] figure svg:first-child {
	display: none;
}

details[open] figure svg:last-child {
	display: block;
}

summary {
	color: #0f40ec;
	@supports (color: oklch(48.23% 0.258 264.52)) {
		color: oklch(48.23% 0.258 264.52);
	}
	font-size: 24px;
	list-style: none;
	cursor: pointer;
}

summary figure {
	align-items: center;
	display: flex;
	gap: var(--unit-small);
}

summary figure svg path {
	stroke: #0f40ec;
	@supports (stroke: oklch(48.23% 0.258 264.52)) {
		stroke: oklch(48.23% 0.258 264.52);
	}
}

nav .inline-navigation {
	display: none;
}

/* Responsiviteit van mobiel naar grotere schermen */
@media (min-width: 60rem) {
	nav .dropdown-navigation {
		display: none;
	}

	nav .inline-navigation {
		display: block;
	}

	nav .inline-navigation ul {
		display: flex;
		flex-direction: row;
	}
}
</style>
