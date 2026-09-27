<script lang="ts">
	import { categories, coverImage } from '$lib/catalog';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { reveal } from '$lib/motion';

	// Use the first product's cover image as the category thumbnail.
	function categoryImage(products: (typeof categories)[number]['products']): string {
		return products[0] ? coverImage(products[0]) : '';
	}
</script>

<svelte:head>
	<title>{m.products_title()}</title>
	<meta name="description" content={m.products_meta_description()} />
</svelte:head>

<section class="mx-auto max-w-site px-4 pt-10 pb-16">
	<header class="mb-8 flex rise-children flex-col gap-[0.4rem]">
		<span class="eyebrow">{m.products_eyebrow()}</span>
		<h1 class="text-[2rem]">{m.products_heading()}</h1>
		<p class="max-w-[34rem] text-ink-soft">{m.products_intro()}</p>
	</header>

	<div class="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
		{#each categories as c (c.slug)}
			<a
				href={localizeHref('/produkty/' + c.slug)}
				class="group flex flex-col focus-visible:outline-none"
				{@attach reveal()}
			>
				<div
					class="aspect-square w-full overflow-hidden rounded-[4px] bg-bg-alt outline-2 outline-offset-2 outline-transparent transition-[outline-color] duration-300 group-hover:outline-accent group-focus-visible:outline-accent"
				>
					<img
						src={categoryImage(c.products)}
						alt={c.name()}
						class="h-full w-full object-cover transition-transform duration-[1.2s] ease-(--ease-soft) group-hover:scale-105"
						loading="lazy"
					/>
				</div>
				<div class="flex flex-col gap-[0.15rem] px-[0.1rem] py-[0.6rem]">
					<h2 class="text-[1.15rem] font-medium transition-colors group-hover:text-accent-dark">
						{c.name()}
					</h2>
					<span class="text-[0.9rem] text-ink-soft">{c.description()}</span>
					<span class="mt-[0.2rem] text-[0.8rem] tracking-[0.02em] text-accent-dark">
						{m.category_count_products({ count: c.products.length })}
					</span>
				</div>
			</a>
		{/each}
	</div>
</section>
