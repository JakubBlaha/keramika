<script lang="ts">
	import { allProducts, coverImage, getProduct } from '$lib/catalog';
	import { reveal } from '$lib/motion';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import ProductGrid from '$lib/components/ProductGrid.svelte';

	// Draft homepage - placeholder content, no real data/logic yet.
	const values = $derived([
		{ title: m.value_love_title(), text: m.value_love_text() },
		{ title: m.value_motifs_title(), text: m.value_motifs_text() },
		{ title: m.value_original_title(), text: m.value_original_text() }
	]);

	// Show the first catalog products as "featured" - enough for at least two
	// rows of the 4-column grid (REQ-HOME-003). These link to their real
	// detail pages.
	const featured = $derived(allProducts().slice(0, 8));

	// Real pieces for the hero collage: one large photo, two smaller ones.
	const heroPieces = $derived(
		['dubanek', 'andel', 'listek'].flatMap((slug) => {
			const found = getProduct(slug);
			return found ? [{ src: coverImage(found.product), alt: found.product.name() }] : [];
		})
	);
</script>

<svelte:head>
	<title>{m.home_title()}</title>
	<meta name="description" content={m.home_meta_description()} />
</svelte:head>

<!-- Hero -->
<section class="overflow-hidden">
	<div
		class="mx-auto flex max-w-site flex-col gap-10 px-4 pt-10 pb-14 md:flex-row md:items-center md:gap-12 md:pt-14 md:pb-20"
	>
		<div class="flex rise-children flex-col gap-4 md:flex-1">
			<span class="eyebrow">{m.hero_eyebrow()}</span>
			<h1 class="text-[2.6rem] font-medium md:text-[3.6rem]">
				{m.hero_heading_line1()}<br /><em class="text-accent-dark">{m.hero_heading_line2()}</em>
			</h1>
			<p class="max-w-[34rem] text-ink-soft">
				{m.hero_text()}
			</p>
			<a href={localizeHref('/produkty')} class="group mt-2 btn self-start btn-primary">
				{m.hero_cta()}
				<span
					class="transition-transform duration-300 ease-(--ease-soft) group-hover:translate-x-1"
					aria-hidden="true">&rarr;</span
				>
			</a>
		</div>

		<!-- Collage of real pieces on a soft clay-coloured shape -->
		<div class="relative mx-auto aspect-square w-full max-w-[30rem] md:flex-1">
			<div
				class="absolute inset-[6%] animate-[fade-in_1.2s_var(--ease-soft)_both] rounded-[42%_58%_55%_45%/48%_42%_58%_52%] bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.4),transparent_55%),linear-gradient(150deg,#d9b79f,#c4785a_55%,#a75f42)] opacity-90"
				aria-hidden="true"
			></div>
			{#each heroPieces as piece, i (piece.src)}
				<div
					class={[
						'absolute animate-float',
						i === 0 && 'top-[12%] left-[8%] w-[58%]',
						i === 1 && 'top-[4%] right-[4%] w-[36%] [animation-delay:-3s]',
						i === 2 && 'right-[8%] bottom-[5%] w-[44%] [animation-delay:-5.5s]'
					]}
				>
					<img
						src={piece.src}
						alt={piece.alt}
						class={[
							'w-full animate-rise rounded-[4px] object-cover shadow-[0_1.5rem_3rem_-1.5rem_rgb(61_53_48/0.55)] ring-4 ring-bg',
							i === 0 ? 'aspect-[4/5]' : 'aspect-square'
						]}
						style:animation-delay="{250 + i * 150}ms"
						loading="eager"
					/>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Value propositions -->
<section class="bg-bg-alt bg-linen py-12 md:py-20">
	<div class="mx-auto grid max-w-site gap-8 px-4 md:grid-cols-3 md:gap-10">
		{#each values as v, i (v.title)}
			<div class="flex flex-col gap-[0.4rem] border-t border-accent/40 pt-5" {@attach reveal()}>
				<span class="font-display text-[1.1rem] text-accent italic" aria-hidden="true"
					>0{i + 1}</span
				>
				<h3 class="text-[1.4rem]">{v.title}</h3>

				<p class="text-[0.95rem] text-ink-soft">{v.text}</p>
			</div>
		{/each}
	</div>
</section>

<!-- Featured products -->
<section class="mx-auto max-w-site px-4 pt-16 pb-16">
	<header class="mb-8 flex flex-col gap-[0.4rem]" {@attach reveal()}>
		<span class="eyebrow">{m.featured_eyebrow()}</span>
		<h2 class="text-[2rem]">{m.featured_heading()}</h2>
	</header>

	<ProductGrid products={featured} cols={4} />

	<div class="flex justify-center pt-10" {@attach reveal()}>
		<a href={localizeHref('/produkty')} class="btn btn-outline">{m.featured_cta()}</a>
	</div>
</section>

<!-- About teaser (About Me) -->
<section
	class="flex flex-col md:mx-auto md:max-w-site md:flex-row md:items-center md:gap-10 md:px-4"
>
	<div
		class="aspect-[4/3] w-full bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.35),transparent_55%),linear-gradient(150deg,#b9c2ad,#8a9a82_60%,#6f7e68)] md:aspect-square md:flex-1 md:rounded-[4px]"
		aria-hidden="true"
		{@attach reveal()}
	></div>
	<div
		class="flex flex-col gap-4 bg-bg-alt px-4 py-10 md:flex-1 md:bg-transparent md:px-0 md:py-0"
		{@attach reveal()}
	>
		<span class="eyebrow">{m.about_eyebrow()}</span>
		<h2 class="text-[2rem]">{m.about_heading()}</h2>
		<p class="text-ink-soft">
			{m.about_text()}
		</p>
		<a href={localizeHref('/o-nas')} class="btn self-start btn-outline">{m.about_cta()}</a>
	</div>
</section>
