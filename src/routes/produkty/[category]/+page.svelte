<script lang="ts">
	import { categories, getCategory } from '$lib/catalog';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import ProductGrid from '$lib/components/ProductGrid.svelte';

	let { data } = $props();

	// Resolve the category from the language-neutral slug provided by load().
	const category = $derived(getCategory(data.slug)!);
	const products = $derived(category.products);

	// Category switcher (REQ-LISTING-009). On narrow screens the pills scroll
	// sideways; keep the current one centred in view, also after switching.
	let switcher = $state<HTMLElement>();
	$effect(() => {
		const current = switcher?.querySelector<HTMLElement>(`[data-slug="${category.slug}"]`);
		if (!switcher || !current) return;
		switcher.scrollLeft = current.offsetLeft - (switcher.clientWidth - current.offsetWidth) / 2;
	});
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

	<!-- noscroll: switching keeps the visitor where they are, so the pills
	     stay put under the pointer instead of the page jumping to the top. -->
	<nav aria-label={m.category_switcher_label()} class="mb-8 border-y border-line">
		<ul
			bind:this={switcher}
			class="relative -mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-3 md:mx-0 md:flex-wrap md:px-0"
		>
			{#each categories as c (c.slug)}
				{@const current = c.slug === category.slug}
				<li class="shrink-0">
					<a
						href={localizeHref('/produkty/' + c.slug)}
						data-slug={c.slug}
						data-sveltekit-noscroll
						aria-current={current ? 'page' : undefined}
						class={[
							'inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[0.9rem] tracking-[0.02em] whitespace-nowrap transition-colors duration-300',
							current
								? 'border-ink bg-ink text-bg'
								: 'border-line text-ink-soft hover:border-accent hover:text-accent-dark'
						]}
					>
						{c.name()}
						<span class={['text-[0.72rem]', current ? 'text-bg/70' : 'text-accent']}
							>{c.products.length}</span
						>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	{#if products.length === 0}
		<p class="text-ink-soft">{m.category_empty()}</p>
	{:else}
		<ProductGrid {products} cols={3} />
	{/if}
</section>
