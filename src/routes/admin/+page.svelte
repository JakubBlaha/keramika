<script lang="ts">
	// Admin dashboard / landing page. Visiting /admin shows a hub linking to each
	// admin area. Only orders is built so far; the product and category areas are
	// shown as coming-soon placeholders so the structure is visible.
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

	type Card = {
		title: string;
		desc: string;
		href: string | null;
	};

	const cards: Card[] = [
		{
			title: m.admin_card_orders_title(),
			desc: m.admin_card_orders_desc(),
			href: localizeHref('/admin/objednavky')
		},
		{
			title: m.admin_card_products_title(),
			desc: m.admin_card_products_desc(),
			href: null
		},
		{
			title: m.admin_card_categories_title(),
			desc: m.admin_card_categories_desc(),
			href: null
		}
	];
</script>

<svelte:head>
	<title>{m.admin_dashboard_heading()} · {m.admin_title()}</title>
</svelte:head>

<header class="mb-6 flex flex-col gap-1">
	<h1 class="text-[1.6rem]">{m.admin_dashboard_heading()}</h1>
	<p class="text-[0.9rem] text-ink-soft">{m.admin_dashboard_intro()}</p>
</header>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each cards as card (card.title)}
		{#if card.href}
			<a
				href={card.href}
				class="flex flex-col gap-2 rounded-[4px] border border-line bg-white p-5 transition-colors hover:border-accent hover:bg-bg-alt"
			>
				<span class="font-display text-[1.05rem]">{card.title}</span>
				<span class="text-[0.85rem] text-ink-soft">{card.desc}</span>
			</a>
		{:else}
			<div
				class="flex flex-col gap-2 rounded-[4px] border border-dashed border-line bg-white/60 p-5"
			>
				<span class="flex items-center gap-2">
					<span class="font-display text-[1.05rem] text-ink-soft">{card.title}</span>
					<span
						class="rounded-full bg-bg-alt px-2 py-0.5 text-[0.65rem] tracking-[0.08em] text-ink-soft uppercase"
					>
						{m.admin_card_coming_soon()}
					</span>
				</span>
				<span class="text-[0.85rem] text-ink-soft">{card.desc}</span>
			</div>
		{/if}
	{/each}
</div>
