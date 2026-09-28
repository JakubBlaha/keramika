<script lang="ts">
	// Reusable product tile: cover image (with the accent-outline hover), a
	// sold-out/last-piece badge, name, meta line and price. Used on the
	// homepage (featured), category listing, and the related-products section
	// of the product detail page - previously each page duplicated this markup.
	import type { Product } from '$lib/catalog';
	import { availableCount, coverImage } from '$lib/catalog';
	import { reveal } from '$lib/motion';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { product }: { product: Product } = $props();

	const available = $derived(availableCount(product));
	const cover = $derived(coverImage(product));

	// Hover preview: the cover "zooms out" into a grid of up to 4 pieces of
	// this product (REQ-LISTING-008). Available pieces come first, so the
	// cover (first available piece) stays in the top-left cell; sold pieces
	// only fill leftover cells and are greyed out.
	const pieces = $derived(
		[
			...product.instances.filter((i) => i.available),
			...product.instances.filter((i) => !i.available)
		]
			.filter((i) => i.images[0])
			.slice(0, 4)
			.map((i) => ({ id: i.id, src: i.images[0], sold: !i.available }))
	);
	const hasPreview = $derived(pieces.length > 1);

	// Gentle ease-in-out: a front-loaded curve makes the start read as a jump.
	const ZOOM = '0.7s cubic-bezier(0.4, 0, 0.2, 1)';

	// The grid is mounted on the first mouse hover, once its photos are loaded
	// and decoded (so none pop in mid-zoom), and activated a frame later so the
	// zoom also plays on that first hover.
	let mounted = $state(false);
	let active = $state(false);
	let inside = false;
	let loading: Promise<unknown> | undefined;

	function preload(): Promise<unknown> {
		loading ??= Promise.all(
			pieces.map((piece) => {
				const img = new Image();
				img.src = piece.src;
				return img.decode().catch(() => {});
			})
		);
		return loading;
	}

	async function onEnter(event: PointerEvent) {
		if (event.pointerType !== 'mouse' || !hasPreview) return;
		inside = true;
		if (mounted) {
			active = true;
			return;
		}
		await preload();
		if (!inside || mounted) return;
		mounted = true;
		requestAnimationFrame(() => requestAnimationFrame(() => (active = inside)));
	}

	function onLeave() {
		inside = false;
		active = false;
	}
</script>

<a
	href={localizeHref('/produkt/' + product.slug)}
	class="group flex flex-col focus-visible:outline-none"
	onpointerenter={onEnter}
	onpointerleave={onLeave}
	{@attach reveal()}
>
	<div
		class="relative aspect-square w-full overflow-hidden rounded-[4px] bg-bg-alt outline-2 outline-offset-2 outline-transparent transition-[outline-color] duration-300 group-hover:outline-accent group-focus-visible:outline-accent"
	>
		<img
			src={cover}
			alt={product.name}
			class={[
				'h-full w-full object-cover transition-transform duration-[1.2s] ease-(--ease-soft)',
				!hasPreview && 'group-hover:scale-105'
			]}
			style:view-transition-name="product-{product.slug}"
			loading="lazy"
		/>
		{#if mounted}
			<!-- Pure zoom, no fade. The grid is laid out at twice the tile size
			     with its first cell exactly one tile, so at scale 1 it is
			     pixel-identical to the cover photo; shrinking to 0.5 reveals the
			     other pieces. Starting at full resolution and only scaling down
			     keeps the photos sharp throughout. Once zoomed back in, the grid
			     is hidden instantly (visibility flips when the zoom ends).
			     2 pieces: two side by side, vertically centred, zoom from the left edge.
			     3 pieces: two squares over one wide cell, from the top-left.
			     4 pieces: 2x2, from the top-left. -->
			<div
				class={[
					'absolute left-0 h-[200%] w-[200%] gap-1 bg-bg',
					pieces.length === 2
						? '-top-1/2 flex origin-left items-center'
						: 'top-0 grid origin-top-left grid-cols-[50%_1fr] grid-rows-[50%_1fr]',
					active ? 'visible scale-50' : 'invisible scale-100'
				]}
				style:will-change="scale"
				style:transition="scale {ZOOM}, visibility 0s {active ? '0s' : ZOOM.split(' ')[0]}"
				data-testid="piece-preview"
				aria-hidden="true"
			>
				{#each pieces as piece, i (piece.id)}
					<div
						class={[
							'bg-cover bg-center',
							pieces.length === 2 && (i === 0 ? 'h-1/2 w-1/2 shrink-0' : 'h-1/2 flex-1'),
							pieces.length === 3 && i === 2 && 'col-span-2',
							// The first cell must match the cover photo exactly.
							piece.sold && i > 0 && 'grayscale'
						]}
						style:background-image="url({piece.src})"
					></div>
				{/each}
			</div>
		{/if}
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
		<h3 class="text-[1.05rem] font-medium transition-colors group-hover:text-accent-dark">
			{product.name}
		</h3>
		<span class="text-[0.78rem] tracking-[0.02em] text-ink-soft">{product.meta}</span>
		<span class="mt-[0.2rem] text-[0.95rem] text-accent-dark">
			{m.price_czk({ amount: product.price })}
		</span>
	</div>
</a>
