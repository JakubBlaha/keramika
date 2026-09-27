<script lang="ts">
	import { allProducts } from '$lib/catalog';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import ProductGrid from '$lib/components/ProductGrid.svelte';

	// Draft homepage - placeholder content, no real data/logic yet.
	const values = $derived([
		{ title: m.value_handmade_title(), text: m.value_handmade_text() },
		{ title: m.value_motifs_title(), text: m.value_motifs_text() },
		{ title: m.value_original_title(), text: m.value_original_text() }
	]);

	// Show the first few catalog products as "featured". These link to their
	// real detail pages.
	const featured = $derived(allProducts().slice(0, 4));
</script>

<svelte:head>
	<title>{m.home_title()}</title>
	<meta name="description" content={m.home_meta_description()} />
</svelte:head>

<!-- Hero -->
<section
	class="flex flex-col md:mx-auto md:max-w-site md:flex-row md:items-center md:gap-10 md:px-4 md:pt-6"
>
	<div
		class="aspect-[4/3] w-full bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.4),transparent_55%),linear-gradient(150deg,#d9b79f,#c4785a_55%,#a75f42)] md:order-2 md:aspect-square md:flex-1 md:rounded-[4px]"
		aria-hidden="true"
	></div>
	<div class="flex flex-col gap-4 px-4 pt-10 pb-6 md:order-1 md:flex-1 md:px-0 md:py-0">
		<span class="eyebrow">{m.hero_eyebrow()}</span>
		<h1 class="text-[2.6rem] font-medium md:text-[3.4rem]">
			{m.hero_heading_line1()}<br />{m.hero_heading_line2()}
		</h1>
		<p class="max-w-[34rem] text-ink-soft">
			{m.hero_text()}
		</p>
		<a href={localizeHref('/produkty')} class="mt-2 btn self-start btn-primary">{m.hero_cta()}</a>
	</div>
</section>

<!-- Value propositions -->
<section class="bg-bg-alt px-4 py-10 md:py-16">
	<div class="mx-auto grid max-w-site gap-6 md:grid-cols-3 md:gap-10">
		{#each values as v (v.title)}
			<div class="flex flex-col gap-[0.4rem]">
				<h3 class="text-[1.4rem]">{v.title}</h3>

				<p class="text-[0.95rem] text-ink-soft">{v.text}</p>
			</div>
		{/each}
	</div>
</section>

<!-- Featured products -->
<section class="mx-auto max-w-site px-4 pt-16 pb-16">
	<header class="mb-8 flex flex-col gap-[0.4rem]">
		<span class="eyebrow">{m.featured_eyebrow()}</span>
		<h2 class="text-[2rem]">{m.featured_heading()}</h2>
	</header>

	<ProductGrid products={featured} cols={4} />

	<div class="flex justify-center pt-10">
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
	></div>
	<div class="flex flex-col gap-4 bg-bg-alt px-4 py-10 md:flex-1 md:bg-transparent md:px-0 md:py-0">
		<span class="eyebrow">{m.about_eyebrow()}</span>
		<h2 class="text-[2rem]">{m.about_heading()}</h2>
		<p class="text-ink-soft">
			{m.about_text()}
		</p>
		<a href={localizeHref('/o-nas')} class="btn self-start btn-outline">{m.about_cta()}</a>
	</div>
</section>
