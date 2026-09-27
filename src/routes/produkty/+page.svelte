<script lang="ts">
	// Categories landing (REQ-LISTING-001). Deliberately not a product-style
	// grid: each category is an editorial "chapter" - a collage of real pieces
	// on a tinted clay shape (echoing the homepage hero) beside a large
	// numbered title - alternating sides on wider screens.
	import { categories, type Category } from '$lib/catalog';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { reveal } from '$lib/motion';

	// Up to three photos for a category's collage: each product's cover first
	// (available pieces before sold ones), then further pieces, so the collage
	// shows as much variety as the category has.
	function collage(category: Category): string[] {
		const perProduct = category.products.map((p) =>
			[...p.instances.filter((i) => i.available), ...p.instances.filter((i) => !i.available)]
				.map((i) => i.images[0])
				.filter(Boolean)
		);
		const images: string[] = [];
		for (let round = 0; images.length < 3; round++) {
			const next = perProduct.map((list) => list[round]).filter(Boolean);
			if (next.length === 0) break;
			images.push(...next);
		}
		return images.slice(0, 3);
	}

	// Per-chapter clay tint and blob shape, cycled.
	const tints = [
		'bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.4),transparent_55%),linear-gradient(150deg,#d9b79f,#c4785a_55%,#a75f42)] rounded-[42%_58%_55%_45%/48%_42%_58%_52%]',
		'bg-[radial-gradient(circle_at_30%_35%,rgba(255,255,255,0.35),transparent_55%),linear-gradient(150deg,#c9d0bd,#8a9a82_60%,#6f7e68)] rounded-[55%_45%_40%_60%/45%_55%_45%_55%]',
		'bg-[radial-gradient(circle_at_65%_40%,rgba(255,255,255,0.45),transparent_55%),linear-gradient(150deg,#f2e6d6,#dcc3a4_60%,#c4a07c)] rounded-[48%_52%_60%_40%/55%_40%_60%_45%]',
		'bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.35),transparent_55%),linear-gradient(150deg,#e3d2cb,#b8958a_60%,#8f6f66)] rounded-[60%_40%_48%_52%/42%_58%_42%_58%]'
	];

	// Collage tile placement: one large piece and two smaller ones. The hover
	// state fans them apart (motion-safe only).
	const tiles = [
		'top-[14%] left-[10%] w-[52%] -rotate-3 group-hover:motion-safe:-translate-x-[4%] group-hover:motion-safe:-rotate-6',
		'top-[6%] right-[8%] w-[34%] rotate-6 group-hover:motion-safe:translate-x-[6%] group-hover:motion-safe:-translate-y-[4%] group-hover:motion-safe:rotate-12',
		'right-[14%] bottom-[6%] w-[40%] -rotate-2 group-hover:motion-safe:translate-x-[4%] group-hover:motion-safe:translate-y-[4%] group-hover:motion-safe:rotate-3'
	];
</script>

<svelte:head>
	<title>{m.products_title()}</title>
	<meta name="description" content={m.products_meta_description()} />
</svelte:head>

<section class="mx-auto max-w-site px-4 pt-10 pb-16">
	<header
		class="mb-10 flex rise-children flex-col gap-[0.4rem] md:mb-14 md:items-center md:text-center"
	>
		<span class="eyebrow">{m.products_eyebrow()}</span>
		<h1 class="text-[2.6rem] font-medium md:text-[3.4rem]">{m.products_heading()}</h1>
		<p class="max-w-[34rem] text-ink-soft">{m.products_intro()}</p>
	</header>

	<ol class="flex flex-col gap-14 md:gap-6">
		{#each categories as c, i (c.slug)}
			<li {@attach reveal()}>
				<a
					href={localizeHref('/produkty/' + c.slug)}
					class="group grid items-center gap-6 rounded-[4px] outline-2 outline-offset-4 outline-transparent transition-[outline-color] duration-300 focus-visible:outline-accent md:grid-cols-2 md:gap-14"
				>
					<!-- Collage -->
					<div
						class={[
							'relative mx-auto aspect-[5/4] w-full max-w-[34rem]',
							i % 2 === 1 && 'md:order-2'
						]}
					>
						<div
							class={[
								'absolute inset-[4%] opacity-90 transition-transform duration-1000 ease-(--ease-soft) group-hover:motion-safe:scale-[1.04]',
								tints[i % tints.length]
							]}
							aria-hidden="true"
						></div>
						{#each collage(c) as src, t (src)}
							<img
								{src}
								alt={t === 0 ? c.name() : ''}
								class={[
									'absolute rounded-[4px] object-cover shadow-[0_1.5rem_3rem_-1.5rem_rgb(61_53_48/0.55)] ring-4 ring-bg transition-transform duration-700 ease-(--ease-soft)',
									t === 0 ? 'aspect-[4/5]' : 'aspect-square',
									tiles[t]
								]}
								loading={i === 0 ? 'eager' : 'lazy'}
							/>
						{/each}
					</div>

					<!-- Chapter text -->
					<div
						class={['flex flex-col gap-3', i % 2 === 1 && 'md:order-1 md:items-end md:text-right']}
					>
						<span
							class="font-display text-[3.5rem] leading-none text-accent/70 italic md:text-[5rem]"
							aria-hidden="true">{String(i + 1).padStart(2, '0')}</span
						>
						<h2
							class="text-[2.2rem] font-medium transition-colors group-hover:text-accent-dark md:text-[2.8rem]"
						>
							{c.name()}
						</h2>
						<p class="max-w-[26rem] text-ink-soft">{c.description()}</p>
						<span class="text-[0.8rem] tracking-[0.12em] text-accent-dark uppercase">
							{m.category_count_products({ count: c.products.length })}
						</span>
						<span
							class="mt-2 inline-flex items-center gap-2 border-b border-ink pb-1 text-[0.9rem] tracking-[0.04em]"
						>
							{m.products_view_category()}
							<span
								class="transition-transform duration-300 ease-(--ease-soft) group-hover:translate-x-1"
								aria-hidden="true">&rarr;</span
							>
						</span>
					</div>
				</a>
			</li>
		{/each}
	</ol>
</section>
