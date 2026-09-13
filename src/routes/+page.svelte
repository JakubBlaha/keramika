<script lang="ts">
	import { allProducts, coverImage } from '$lib/catalog';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

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
<section class="flex flex-col">
	<div
		class="aspect-[4/3] w-full bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.4),transparent_55%),linear-gradient(150deg,#d9b79f,#c4785a_55%,#a75f42)]"
		aria-hidden="true"
	></div>
	<div class="flex flex-col gap-4 px-4 pt-10 pb-6">
		<span class="eyebrow">{m.hero_eyebrow()}</span>
		<h1 class="text-[2.6rem] font-medium">
			{m.hero_heading_line1()}<br />{m.hero_heading_line2()}
		</h1>
		<p class="max-w-[34rem] text-ink-soft">
			{m.hero_text()}
		</p>
		<a href={localizeHref('/produkty')} class="mt-2 btn self-start btn-primary">{m.hero_cta()}</a>
	</div>
</section>

<!-- Value propositions -->
<section class="flex flex-col gap-6 bg-bg-alt px-4 py-10">
	{#each values as v (v.title)}
		<div class="flex flex-col gap-[0.4rem]">
			<h3 class="text-[1.4rem]">{v.title}</h3>

			<p class="text-[0.95rem] text-ink-soft">{v.text}</p>
		</div>
	{/each}
</section>

<!-- Featured products -->
<section class="mx-auto max-w-site px-4 pt-16">
	<header class="mb-6 flex flex-col gap-[0.4rem]">
		<span class="eyebrow">{m.featured_eyebrow()}</span>
		<h2 class="text-[2rem]">{m.featured_heading()}</h2>
	</header>

	<div class="grid grid-cols-2 gap-4">
		{#each featured as p (p.slug)}
			<a
				href={localizeHref('/produkt/' + p.slug)}
				class="group flex flex-col transition duration-200"
			>
				<div class="aspect-square w-full overflow-hidden rounded-[4px] bg-bg-alt">
					<img
						src={coverImage(p)}
						alt={p.name()}
						class="h-full w-full object-cover transition duration-200 group-hover:scale-[1.015] group-hover:brightness-[0.98]"
						loading="lazy"
					/>
				</div>
				<div class="flex flex-col gap-[0.15rem] px-[0.1rem] py-[0.6rem]">
					<h3 class="text-[1.05rem] font-medium">{p.name()}</h3>
					<span class="text-[0.78rem] tracking-[0.02em] text-ink-soft">{p.meta()}</span>
					<span class="mt-[0.2rem] text-[0.95rem] text-accent-dark"
						>{m.price_czk({ amount: p.price })}</span
					>
				</div>
			</a>
		{/each}
	</div>

	<div class="flex justify-center pt-10">
		<a href={localizeHref('/produkty')} class="btn btn-outline">{m.featured_cta()}</a>
	</div>
</section>

<!-- About teaser (About Me) -->
<section class="mt-16 flex flex-col">
	<div
		class="aspect-[4/3] w-full bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.35),transparent_55%),linear-gradient(150deg,#b9c2ad,#8a9a82_60%,#6f7e68)]"
		aria-hidden="true"
	></div>
	<div class="flex flex-col gap-4 bg-bg-alt px-4 py-10">
		<span class="eyebrow">{m.about_eyebrow()}</span>
		<h2 class="text-[2rem]">{m.about_heading()}</h2>
		<p class="text-ink-soft">
			{m.about_text()}
		</p>
		<a href={localizeHref('/o-nas')} class="btn self-start btn-outline">{m.about_cta()}</a>
	</div>
</section>
