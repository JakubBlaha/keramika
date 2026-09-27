<script lang="ts">
	// Gallery of every unique piece (instance), grouped by product. The grid is
	// photos only; stock status and the buy / view-product actions appear only
	// in the fullscreen view (REQ-GALLERY-002..006).
	import { allProducts, type Product, type ProductInstance } from '$lib/catalog';
	import { cart } from '$lib/cart.svelte';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { EASE_SOFT, prefersReducedMotion, reveal } from '$lib/motion';

	type Item = { product: Product; instance: ProductInstance; index: number };

	// Sections per product; `index` is the position in the flat list so the
	// fullscreen view can step across product boundaries.
	const sections = (() => {
		let index = 0;
		return allProducts()
			.filter((product) => product.instances.length > 0)
			.map((product) => ({
				product,
				items: product.instances.map((instance): Item => ({ product, instance, index: index++ }))
			}));
	})();
	const items = sections.flatMap((s) => s.items);

	let dialog = $state<HTMLDialogElement>();
	let openIndex = $state<number | null>(null);
	// Which photo of the open instance is shown (instances can have several).
	let imageIndex = $state(0);

	const current = $derived(openIndex === null ? undefined : items[openIndex]);

	function open(index: number) {
		openIndex = index;
		imageIndex = 0;
		dialog?.showModal();
	}

	let stageImg = $state<HTMLImageElement>();

	// Slide the new photo in from the side we are moving towards.
	function step(delta: number) {
		if (openIndex === null) return;
		openIndex = (openIndex + delta + items.length) % items.length;
		imageIndex = 0;
		if (!prefersReducedMotion()) {
			stageImg?.animate(
				[
					{ opacity: 0, transform: `translateX(${delta * 2.5}rem)` },
					{ opacity: 1, transform: 'none' }
				],
				{ duration: 500, easing: EASE_SOFT }
			);
		}
	}

	function label(item: Item): string {
		return `${item.product.name()} ${item.instance.label}`;
	}

	// Lock page scroll behind the fullscreen view. The teardown also runs when
	// a link inside the dialog navigates away and unmounts the page.
	$effect(() => {
		if (openIndex === null) return;
		const root = document.documentElement;
		const previous = root.style.overflow;
		root.style.overflow = 'hidden';
		return () => {
			root.style.overflow = previous;
		};
	});

	function onKeydown(event: KeyboardEvent) {
		if (openIndex === null) return;
		if (event.key === 'ArrowLeft') step(-1);
		else if (event.key === 'ArrowRight') step(1);
	}

	// Horizontal swipe on touch devices steps between pieces.
	let touchX: number | null = null;

	function onTouchEnd(event: TouchEvent) {
		if (touchX === null) return;
		const dx = event.changedTouches[0].clientX - touchX;
		touchX = null;
		if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
	}
</script>

<svelte:head>
	<title>{m.gallery_title()}</title>
	<meta name="description" content={m.gallery_meta_description()} />
</svelte:head>

<svelte:window onkeydown={onKeydown} />

<section class="mx-auto max-w-site px-4 pt-10 pb-16">
	<header class="mb-8 flex rise-children flex-col gap-[0.4rem]">
		<span class="eyebrow">{m.gallery_eyebrow()}</span>
		<h1 class="text-[2rem]">{m.gallery_heading()}</h1>
		<p class="max-w-[34rem] text-ink-soft">{m.gallery_intro()}</p>
	</header>

	<div class="flex flex-col gap-12">
		{#each sections as section (section.product.slug)}
			<section aria-labelledby="gallery-{section.product.slug}">
				<h2 id="gallery-{section.product.slug}" class="mb-4 text-[1.6rem]">
					{section.product.name()}
				</h2>
				<ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
					{#each section.items as item (item.instance.id)}
						<li {@attach reveal()}>
							<button
								type="button"
								class="group block aspect-square w-full cursor-zoom-in overflow-hidden rounded-[4px] bg-bg-alt outline-2 outline-offset-2 outline-transparent transition-[outline-color] duration-300 hover:outline-accent focus-visible:outline-accent"
								aria-label={m.gallery_open({ name: label(item) })}
								onclick={() => open(item.index)}
							>
								<img
									src={item.instance.images[0]}
									alt={label(item)}
									class="h-full w-full object-cover transition-transform duration-[1.2s] ease-(--ease-soft) group-hover:scale-105"
									loading="lazy"
								/>
							</button>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</section>

<dialog
	bind:this={dialog}
	class="m-0 size-full max-h-none max-w-none border-0 bg-ink p-0 text-bg backdrop:bg-ink open:animate-fade-in"
	aria-label={current ? label(current) : m.gallery_heading()}
	onclose={() => (openIndex = null)}
>
	{#if current && openIndex !== null}
		{@const { product, instance } = current}
		{@const image = instance.images[imageIndex] ?? instance.images[0]}
		<div class="flex h-full flex-col">
			<div class="flex items-center justify-between px-4 py-3 text-[0.85rem] text-[#d8cfc4]">
				<span>{openIndex + 1} / {items.length}</span>
				<button
					type="button"
					class="inline-flex h-10 w-10 cursor-pointer items-center justify-center text-bg transition-colors hover:text-accent"
					aria-label={m.gallery_close()}
					onclick={() => dialog?.close()}
				>
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.4"
						aria-hidden="true"
					>
						<path d="M5 5l14 14M19 5L5 19" />
					</svg>
				</button>
			</div>

			<div
				class="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-16"
				role="presentation"
				ontouchstart={(e) => (touchX = e.changedTouches[0].clientX)}
				ontouchend={onTouchEnd}
			>
				<img
					bind:this={stageImg}
					src={image}
					alt={label(current)}
					class="h-full w-full animate-[zoom-in_0.6s_var(--ease-soft)] object-contain"
				/>

				{#if items.length > 1}
					<button
						type="button"
						class="absolute top-1/2 left-2 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center text-bg transition-colors hover:text-accent md:inline-flex"
						aria-label={m.gallery_prev()}
						onclick={() => step(-1)}
					>
						<svg
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.4"
							aria-hidden="true"
						>
							<path d="M15 5l-7 7 7 7" />
						</svg>
					</button>
					<button
						type="button"
						class="absolute top-1/2 right-2 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center text-bg transition-colors hover:text-accent md:inline-flex"
						aria-label={m.gallery_next()}
						onclick={() => step(1)}
					>
						<svg
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.4"
							aria-hidden="true"
						>
							<path d="M9 5l7 7-7 7" />
						</svg>
					</button>
				{/if}
			</div>

			{#if instance.images.length > 1}
				<div class="flex justify-center gap-2 pt-3">
					{#each instance.images as img, i (img)}
						<button
							type="button"
							class="h-2 w-2 cursor-pointer rounded-full transition-colors"
							class:bg-bg={imageIndex === i}
							class:bg-ink-soft={imageIndex !== i}
							aria-label={m.gallery_photo({ number: i + 1 })}
							aria-pressed={imageIndex === i}
							onclick={() => (imageIndex = i)}
						></button>
					{/each}
				</div>
			{/if}

			<div
				class="mx-auto flex w-full max-w-site flex-col gap-4 px-4 pt-4 pb-6 md:flex-row md:items-center md:justify-between"
			>
				<div class="flex animate-rise flex-col gap-[0.4rem] [animation-delay:150ms]">
					<span class="font-display text-[1.5rem] leading-tight">{label(current)}</span>
					<span class="flex items-center gap-2 text-[0.9rem]" data-testid="gallery-status">
						<span
							class="inline-block h-2 w-2 rounded-full"
							class:bg-sage={instance.available}
							class:bg-accent={!instance.available}
							aria-hidden="true"
						></span>
						{instance.available ? m.gallery_in_stock() : m.product_instance_sold()}
						{#if instance.available}
							<span class="text-[#d8cfc4]">·</span>
							{m.price_czk({ amount: instance.price ?? product.price })}
						{/if}
					</span>
				</div>

				{#if instance.available}
					<a
						href={localizeHref('/cart')}
						class="btn btn-primary"
						onclick={() => cart.add(instance.id, product.slug)}
					>
						{cart.has(instance.id) ? m.gallery_view_cart() : m.gallery_buy()}
					</a>
				{:else}
					<a
						href={localizeHref('/produkt/' + product.slug)}
						class="btn border-bg text-bg hover:bg-bg hover:text-ink"
					>
						{m.gallery_view_product()}
					</a>
				{/if}
			</div>
		</div>
	{/if}
</dialog>
