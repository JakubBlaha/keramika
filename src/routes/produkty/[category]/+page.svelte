<script lang="ts">
	import { getCategory } from '$lib/catalog';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import ProductGrid from '$lib/components/ProductGrid.svelte';

	let { data } = $props();

	// Resolve the category from the language-neutral slug provided by load().
	const category = $derived(getCategory(data.slug)!);
	const products = $derived(category.products);
</script>

<svelte:head>
	<title>{category.name()} · {m.brand_name()}</title>
	<meta name="description" content={category.description()} />
</svelte:head>

<section class="mx-auto max-w-site px-4 pt-10 pb-16">
	<a
		href={localizeHref('/produkty')}
		class="mb-6 inline-block text-[0.85rem] tracking-[0.02em] text-ink-soft transition-colors hover:text-accent-dark"
	>
		&larr; {m.category_back_to_products()}
	</a>

	<header class="mb-8 flex rise-children flex-col gap-[0.4rem]">
		<span class="eyebrow">{m.products_eyebrow()}</span>
		<h1 class="text-[2rem]">{category.name()}</h1>
		<p class="max-w-[34rem] text-ink-soft">{category.description()}</p>
	</header>

	{#if products.length === 0}
		<p class="text-ink-soft">{m.category_empty()}</p>
	{:else}
		<ProductGrid {products} cols={3} />
	{/if}
</section>
