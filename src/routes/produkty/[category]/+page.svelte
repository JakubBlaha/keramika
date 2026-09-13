<script lang="ts">
	import { getCategory, availableCount, coverImage } from '$lib/catalog';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

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

	<header class="mb-8 flex flex-col gap-[0.4rem]">
		<span class="eyebrow">{m.products_eyebrow()}</span>
		<h1 class="text-[2rem]">{category.name()}</h1>
		<p class="max-w-[34rem] text-ink-soft">{category.description()}</p>
	</header>

	{#if products.length === 0}
		<p class="text-ink-soft">{m.category_empty()}</p>
	{:else}
		<div class="grid grid-cols-2 gap-4">
			{#each products as p (p.slug)}
				<a
					href={localizeHref('/produkt/' + p.slug)}
					class="group flex flex-col transition duration-200"
				>
					<div class="relative aspect-square w-full overflow-hidden rounded-[4px] bg-bg-alt">
						<img
							src={coverImage(p)}
							alt={p.name()}
							class="h-full w-full object-cover transition duration-200 group-hover:scale-[1.015] group-hover:brightness-[0.98]"
							loading="lazy"
						/>
						{#if availableCount(p) === 0}
							<span
								class="absolute top-2 left-2 bg-ink/80 px-2 py-[0.15rem] text-[0.65rem] tracking-[0.08em] text-bg uppercase"
								>{m.badge_sold_out()}</span
							>
						{:else if availableCount(p) === 1}
							<span
								class="absolute top-2 left-2 bg-accent/90 px-2 py-[0.15rem] text-[0.65rem] tracking-[0.08em] text-bg uppercase"
								>{m.badge_last_piece()}</span
							>
						{/if}
					</div>
					<div class="flex flex-col gap-[0.15rem] px-[0.1rem] py-[0.6rem]">
						<h2 class="text-[1.05rem] font-medium">{p.name()}</h2>
						<span class="text-[0.78rem] tracking-[0.02em] text-ink-soft">{p.meta()}</span>
						<span class="mt-[0.2rem] text-[0.95rem] text-accent-dark">
							{m.price_czk({ amount: p.price })}
						</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</section>
