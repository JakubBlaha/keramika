<script lang="ts">
	// Reusable product tile: cover image (with the accent-outline hover), a
	// sold-out/last-piece badge, name, meta line and price. Used on the
	// homepage (featured), category listing, and the related-products section
	// of the product detail page - previously each page duplicated this markup.
	import type { Product } from '$lib/catalog';
	import { availableCount, coverImage } from '$lib/catalog';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { product }: { product: Product } = $props();

	const available = $derived(availableCount(product));
</script>

<a
	href={localizeHref('/produkt/' + product.slug)}
	class="group flex flex-col transition duration-200"
>
	<div
		class="relative aspect-square w-full overflow-hidden rounded-[4px] bg-bg-alt outline-2 outline-offset-2 outline-transparent transition-[outline-color] duration-200 group-hover:outline-accent"
	>
		<img
			src={coverImage(product)}
			alt={product.name()}
			class="h-full w-full object-cover"
			loading="lazy"
		/>
		{#if available === 0}
			<span
				class="absolute top-2 left-2 bg-ink/80 px-2 py-[0.15rem] text-[0.65rem] tracking-[0.08em] text-bg uppercase"
				>{m.badge_sold_out()}</span
			>
		{:else if available === 1}
			<span
				class="absolute top-2 left-2 bg-accent/90 px-2 py-[0.15rem] text-[0.65rem] tracking-[0.08em] text-bg uppercase"
				>{m.badge_last_piece()}</span
			>
		{/if}
	</div>
	<div class="flex flex-col gap-[0.15rem] px-[0.1rem] py-[0.6rem]">
		<h3 class="text-[1.05rem] font-medium">{product.name()}</h3>
		<span class="text-[0.78rem] tracking-[0.02em] text-ink-soft">{product.meta()}</span>
		<span class="mt-[0.2rem] text-[0.95rem] text-accent-dark">
			{m.price_czk({ amount: product.price })}
		</span>
	</div>
</a>
