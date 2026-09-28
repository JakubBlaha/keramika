<script lang="ts">
	// Responsive grid wrapper for ProductCard: 2 cols on mobile, up to 3/4 on
	// larger screens. Reused on the homepage, category listing, and product
	// detail's related-products section.
	import type { Product } from '$lib/catalog';
	import ProductCard from './ProductCard.svelte';

	let {
		products,
		cols = 4
	}: {
		products: Product[];
		// 4: 2 cols mobile -> 4 cols md+ (homepage, related products).
		// 3-4: 2 cols mobile -> 3 cols md -> 4 cols lg (category listing).
		cols?: 3 | 4;
	} = $props();
</script>

{#if cols === 3}
	<div class="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
		{#each products as product (product.slug)}
			<ProductCard {product} />
		{/each}
	</div>
{:else}
	<div class="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
		{#each products as product (product.slug)}
			<ProductCard {product} />
		{/each}
	</div>
{/if}
