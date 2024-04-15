<template>
	<div>
		<!-- Responsive images van de stenen achtergrond in enhanced .webp -->
		<picture>
			<source
				src="~/assets/images/stone-background/webp/stone-background-1400x933.webp"
				srcset="~/assets/images/stone-background/webp/stone-background-1400x933.webp 1440w"
				media="(min-width: 1440px)"
			/>
			<source
				src="~/assets/images/stone-background/webp/stone-background-1313x875.webp"
				srcset="~/assets/images/stone-background/webp/stone-background-1313x875.webp 1280w"
				media="(min-width: 1280px) and (max-width: 1919px)"
			/>
			<source
				src="~/assets/images/stone-background/webp/stone-background-1027x684.webp"
				srcset="~/assets/images/stone-background/webp/stone-background-1027x684.webp 1024w"
				media="(min-width: 1024px) and (max-width: 1279px)"
			/>
			<source
				src="~/assets/images/stone-background/webp/stone-background-857x571.webp"
				srcset="~/assets/images/stone-background/webp/stone-background-857x571.webp 800w"
				media="(min-width: 800px) and (max-width: 1023px)"
			/>
			<source
				src="~/assets/images/stone-background/webp/stone-background-661x441.webp"
				srcset="~/assets/images/stone-background/webp/stone-background-661x441.webp 640w"
				media="(min-width: 640px) and (max-width: 799px)"
			/>
			<source
				src="~/assets/images/stone-background/webp/stone-background-489x326.webp"
				srcset="~/assets/images/stone-background/webp/stone-background-489x326.webp 480w"
				media="(min-width: 480px) and (max-width: 639px)"
			/>
			<source
				src="~/assets/images/stone-background/png/stone-background-367x245.png"
				srcset="~/assets/images/stone-background/png/stone-background-367x245.png 320w"
				media="(min-width: 320px) and (max-width: 479px)"
			/>

			<img
				src="~/assets/images/stone-background/png/stone-background-200x133.png"
				alt="stenen achtergrond"
				width="720"
				height="720"
			/>
		</picture>

		<!-- Responsive images van de stenen achtergrond in .png -->
		<picture>
			<source
				src="~/assets/images/stone-background/png/stone-background-1440x960.png"
				srcset="~/assets/images/stone-background/png/stone-background-1440x960.png 1440w"
				media="(min-width: 1440px)"
			/>
			<source
				src="~/assets/images/stone-background/png/stone-background-1313x875.png"
				srcset="~/assets/images/stone-background/png/stone-background-1313x875.png 1280w"
				media="(min-width: 1280px) and (max-width: 1919px)"
			/>
			<source
				src="~/assets/images/stone-background/png/stone-background-1027x684.png"
				srcset="~/assets/images/stone-background/png/stone-background-1027x684.png 1024w"
				media="(min-width: 1024px) and (max-width: 1279px)"
			/>
			<source
				src="~/assets/images/stone-background/png/stone-background-857x571.png"
				srcset="~/assets/images/stone-background/png/stone-background-857x571.png 800w"
				media="(min-width: 800px) and (max-width: 1023px)"
			/>
			<source
				src="~/assets/images/stone-background/png/stone-background-661x441.png"
				srcset="~/assets/images/stone-background/png/stone-background-661x441.png 640w"
				media="(min-width: 640px) and (max-width: 799px)"
			/>
			<source
				src="~/assets/images/stone-background/png/stone-background-489x326.png"
				srcset="~/assets/images/stone-background/png/stone-background-489x326.png 480w"
				media="(min-width: 480px) and (max-width: 639px)"
			/>
			<source
				src="~/assets/images/stone-background/png/stone-background-367x245.png"
				srcset="~/assets/images/stone-background/png/stone-background-367x245.png 320w"
				media="(min-width: 320px) and (max-width: 479px)"
			/>
		</picture>
	</div>
</template>

<style scoped>
picture {
	display: block;
}

picture img {
	position: fixed;
	width: 100%;
	height: 105vh;
	z-index: -1;
	top: 0;
	left: 0;
	object-fit: cover;
	mix-blend-mode: multiply;
	opacity: 50%;
}
</style>
