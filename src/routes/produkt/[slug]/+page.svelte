<script lang="ts">
	import {
		getProduct,
		getRelated,
		availableCount,
		totalCount,
		coverImage,
		type ProductInstance
	} from '$lib/catalog';
	import { cart } from '$lib/cart.svelte';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import ProductGrid from '$lib/components/ProductGrid.svelte';
	import { EASE_SOFT, prefersReducedMotion, reveal } from '$lib/motion';
	import { fly, slide } from 'svelte/transition';

	let { data } = $props();

	// Resolve product/category from the language-neutral slug provided by load().
	const found = $derived(getProduct(data.slug)!);
	const product = $derived(found.product);
	const category = $derived(found.category);
	const related = $derived(getRelated(data.slug));

	const available = $derived(availableCount(product));
	const total = $derived(totalCount(product));
	const soldOut = $derived(available === 0);

	// Currently selected unique piece (instance). Defaults to the first
	// available one when the product changes.
	let selectedId = $state<string | null>(null);
	// Index of the currently shown image within the selected instance's gallery.
	let activeImage = $state(0);

	$effect(() => {
		// React to product changes on client-side navigation.
		void data.slug;
		const firstAvailable = product.instances.find((i) => i.available);
		selectedId = firstAvailable ? firstAvailable.id : (product.instances[0]?.id ?? null);
		activeImage = 0;
	});

	const selected = $derived<ProductInstance | undefined>(
		product.instances.find((i) => i.id === selectedId)
	);

	// The gallery follows the selected instance's images; price falls back to
	// the product default when the instance has no own price.
	const galleryImages = $derived(selected?.images ?? []);
	const heroImage = $derived(galleryImages[activeImage] ?? galleryImages[0] ?? coverImage(product));
	const currentPrice = $derived(selected?.price ?? product.price);

	// Which accordion section is open (only one at a time).
	let openSection = $state<'about' | 'care' | 'shipping' | null>('about');

	function toggle(section: 'about' | 'care' | 'shipping') {
		openSection = openSection === section ? null : section;
	}

	let heroEl = $state<HTMLImageElement>();

	// Soft cross-fade when the shown photo changes (another piece or thumb).
	function showImage(update: () => void) {
		update();
		if (!prefersReducedMotion()) {
			heroEl?.animate(
				[
					{ opacity: 0.25, transform: 'scale(1.03)' },
					{ opacity: 1, transform: 'none' }
				],
				{ duration: 600, easing: EASE_SOFT }
			);
		}
	}

	function selectInstance(instance: ProductInstance) {
		if (!instance.available || instance.id === selectedId) return;
		showImage(() => {
			selectedId = instance.id;
			activeImage = 0;
		});
	}

	// Confirmation shown under the button after adding (reset per product).
	let justAdded = $state(false);
	$effect(() => {
		void data.slug;
		justAdded = false;
	});

	// A specific available instance must be selected to add to the cart.
	// Adding an instance already in the cart is a no-op (REQ-CART-004).
	function addToCart() {
		if (!selected || !selected.available) return;
		cart.add(selected.id, product.slug);
		justAdded = true;
	}
</script>

<svelte:head>
	<title>{product.name()} · {m.brand_name()}</title>
	<meta name="description" content={product.description()} />
</svelte:head>

<article class="mx-auto max-w-site px-4 pt-10 pb-16">
	<a
		href={localizeHref('/produkty/' + category.slug)}
		class="mb-6 inline-block text-[0.85rem] tracking-[0.02em] text-ink-soft transition-colors hover:text-accent-dark"
	>
		&larr; {m.product_back_to_category()}
	</a>

	<div class="flex flex-col gap-8 md:flex-row md:gap-10">
		<!-- Image gallery (reflects the selected piece) -->
		<div class="flex flex-col gap-3 md:w-1/2">
			<div class="aspect-square w-full overflow-hidden rounded-[4px] bg-bg-alt">
				{#if heroImage}
					<img
						bind:this={heroEl}
						src={heroImage}
						alt={product.name()}
						class="h-full w-full object-cover"
						style:view-transition-name="product-{product.slug}"
						loading="eager"
					/>
				{/if}
			</div>

			{#if galleryImages.length > 1}
				<div class="flex flex-wrap gap-2">
					{#each galleryImages as img, i (img)}
						<button
							type="button"
							class="aspect-square w-16 cursor-pointer overflow-hidden rounded-[4px] border-2 transition"
							class:border-accent={activeImage === i}
							class:border-transparent={activeImage !== i}
							aria-label={product.name()}
							aria-pressed={activeImage === i}
							onclick={() => showImage(() => (activeImage = i))}
						>
							<img src={img} alt={product.name()} class="h-full w-full object-cover" />
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Product info -->
		<div class="flex rise-children flex-col gap-4 md:w-1/2">
			<div class="flex flex-col gap-[0.4rem]">
				<span class="eyebrow">{category.name()}</span>
				<h1 class="text-[2rem] leading-tight">{product.name()}</h1>
				<span class="text-[1.4rem] text-accent-dark">
					{m.price_czk({ amount: currentPrice })}
				</span>
			</div>

			<!-- Availability -->
			<p class="text-[0.9rem]">
				{#if soldOut}
					<span class="text-accent-dark">{m.product_sold_out()}</span>
				{:else if available === 1}
					<span class="text-sage">{m.product_available_one()}</span>
				{:else}
					<span class="text-sage">{m.product_available_count({ count: available, total })}</span>
				{/if}
			</p>

			<p class="text-ink-soft">{product.description()}</p>

			<!-- Specifications -->
			<dl class="flex flex-col gap-1 border-y border-line py-4 text-[0.9rem]">
				<div class="flex justify-between gap-4">
					<dt class="text-ink-soft">{m.product_spec_size()}</dt>
					<dd>{product.size}</dd>
				</div>
			</dl>

			<!-- Instance picker: each piece is unique and sold only once -->
			{#if !soldOut}
				<div class="flex flex-col gap-2">
					<div class="flex flex-col gap-[0.15rem]">
						<span class="text-[0.95rem] font-medium">{m.product_instances_heading()}</span>
						<span class="text-[0.8rem] text-ink-soft">{m.product_instances_intro()}</span>
					</div>
					<div class="flex flex-wrap gap-3">
						{#each product.instances as inst (inst.id)}
							<button
								type="button"
								class="group relative flex w-20 flex-col items-center gap-1"
								disabled={!inst.available}
								aria-pressed={selectedId === inst.id}
								aria-label={m.product_instance_label({ label: inst.label })}
								onclick={() => selectInstance(inst)}
							>
								<span
									class="aspect-square w-full overflow-hidden rounded-[4px] border-2 transition duration-300 group-enabled:group-hover:-translate-y-0.5"
									class:border-accent={selectedId === inst.id && inst.available}
									class:border-transparent={selectedId !== inst.id && inst.available}
									class:border-line={!inst.available}
									class:opacity-40={!inst.available}
									class:grayscale={!inst.available}
									class:cursor-pointer={inst.available}
									class:cursor-not-allowed={!inst.available}
								>
									<img src={inst.images[0]} alt={inst.label} class="h-full w-full object-cover" />
								</span>
								<span
									class="text-[0.72rem] tracking-[0.02em]"
									class:text-ink-soft={inst.available}
									class:text-accent-dark={!inst.available}
								>
									{inst.available ? inst.label : m.product_instance_sold()}
								</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Add to cart -->
			<div class="flex flex-col gap-2">
				<button
					type="button"
					class="btn grow btn-primary disabled:cursor-not-allowed disabled:opacity-50"
					disabled={soldOut || !selected || !selected.available}
					onclick={addToCart}
				>
					{soldOut ? m.product_sold_out() : m.product_add_to_cart()}
				</button>
				<p class="min-h-[1.6em] text-[0.85rem]" aria-live="polite">
					{#if justAdded}
						<span class="inline-flex items-center gap-2 text-sage" in:fly={{ y: 6, duration: 400 }}>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.8"
								aria-hidden="true"
							>
								<path d="M5 12.5l4.5 4.5L19 7.5" />
							</svg>
							{m.product_added_to_cart()}
							<a
								href={localizeHref('/cart')}
								class="text-accent-dark underline transition-colors hover:text-accent"
								>{m.product_view_cart()}</a
							>
						</span>
					{/if}
				</p>
			</div>

			<!-- Accordion sections -->
			<div class="mt-2 flex flex-col border-t border-line">
				<section class="border-b border-line">
					<button
						type="button"
						class="flex w-full cursor-pointer items-center justify-between py-3 text-left text-[0.95rem] font-medium"
						aria-expanded={openSection === 'about'}
						onclick={() => toggle('about')}
					>
						{m.product_detail_about()}
						<span
							class="text-[1.2rem] leading-none font-light transition-transform duration-400 ease-(--ease-soft)"
							class:rotate-45={openSection === 'about'}
							aria-hidden="true">+</span
						>
					</button>
					{#if openSection === 'about'}
						<p transition:slide={{ duration: 350 }} class="pb-4 text-[0.9rem] text-ink-soft">
							{product.description()}
						</p>
					{/if}
				</section>

				<section class="border-b border-line">
					<button
						type="button"
						class="flex w-full cursor-pointer items-center justify-between py-3 text-left text-[0.95rem] font-medium"
						aria-expanded={openSection === 'care'}
						onclick={() => toggle('care')}
					>
						{m.product_detail_care()}
						<span
							class="text-[1.2rem] leading-none font-light transition-transform duration-400 ease-(--ease-soft)"
							class:rotate-45={openSection === 'care'}
							aria-hidden="true">+</span
						>
					</button>
					{#if openSection === 'care'}
						<p transition:slide={{ duration: 350 }} class="pb-4 text-[0.9rem] text-ink-soft">
							{product.care()}
						</p>
					{/if}
				</section>

				<section class="border-b border-line">
					<button
						type="button"
						class="flex w-full cursor-pointer items-center justify-between py-3 text-left text-[0.95rem] font-medium"
						aria-expanded={openSection === 'shipping'}
						onclick={() => toggle('shipping')}
					>
						{m.product_detail_shipping()}
						<span
							class="text-[1.2rem] leading-none font-light transition-transform duration-400 ease-(--ease-soft)"
							class:rotate-45={openSection === 'shipping'}
							aria-hidden="true">+</span
						>
					</button>
					{#if openSection === 'shipping'}
						<p transition:slide={{ duration: 350 }} class="pb-4 text-[0.9rem] text-ink-soft">
							{m.product_detail_shipping_text()}
						</p>
					{/if}
				</section>
			</div>
		</div>
	</div>

	<!-- Related products -->
	{#if related.length > 0}
		<section class="mt-16">
			<h2 class="mb-6 text-[1.6rem]" {@attach reveal()}>{m.product_related_heading()}</h2>
			<ProductGrid products={related} cols={4} />
		</section>
	{/if}
</article>
