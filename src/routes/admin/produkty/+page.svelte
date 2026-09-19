<script lang="ts">
	// Admin product list (REQ-ADMIN-005). Lists every product with its name,
	// category, and available/total instance counts, and links to create a new
	// product or edit an existing one.
	import { m } from '$lib/paraglide/messages';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { fetchProducts, fetchCategories, fetchProduct } from '$lib/adminApi';
	import type { CategoryRecord, ProductRecord } from '$lib/catalog-model';

	type Row = ProductRecord & { available: number; total: number };

	let rows = $state<Row[]>([]);
	let categories = $state<CategoryRecord[]>([]);
	let loading = $state(true);
	let error = $state(false);

	const locale = $derived(getLocale());

	function categoryName(slug: string): string {
		const cat = categories.find((c) => c.slug === slug);
		return cat ? cat.name[locale] : slug;
	}

	async function load() {
		loading = true;
		error = false;
		try {
			const [products, cats] = await Promise.all([fetchProducts(), fetchCategories()]);
			categories = cats;
			// Instance counts require the per-product read (the list endpoint does
			// not embed instances). Modest catalog size makes N requests fine here.
			rows = await Promise.all(
				products.map(async (p) => {
					const full = await fetchProduct(p.slug);
					return {
						...p,
						available: full.instances.filter((i) => i.available).length,
						total: full.instances.length
					};
				})
			);
		} catch {
			error = true;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		load();
	});
</script>

<svelte:head>
	<title>{m.admin_products_heading()} · {m.admin_title()}</title>
</svelte:head>

<header class="mb-6 flex flex-wrap items-end justify-between gap-3">
	<div class="flex flex-col gap-1">
		<h1 class="text-[1.6rem]">{m.admin_products_heading()}</h1>
		<p class="text-[0.9rem] text-ink-soft">{m.admin_products_intro()}</p>
	</div>
	<a href={localizeHref('/admin/produkty/novy')} class="btn btn-primary">
		{m.admin_products_new_cta()}
	</a>
</header>

{#if loading}
	<p class="py-10 text-center text-ink-soft">{m.admin_loading()}</p>
{:else if error}
	<p class="py-10 text-center text-accent-dark">{m.admin_catalog_load_error()}</p>
{:else if rows.length === 0}
	<p class="py-10 text-center text-ink-soft">{m.admin_products_empty()}</p>
{:else}
	<ul class="flex flex-col divide-y divide-line rounded-[4px] border border-line bg-white">
		{#each rows as p (p.slug)}
			<li class="flex items-center justify-between gap-4 px-4 py-3">
				<div class="flex flex-col">
					<span class="font-medium">{p.name[locale]}</span>
					<span class="text-[0.8rem] text-ink-soft">
						{p.slug} · {categoryName(p.categorySlug)}
					</span>
				</div>
				<div class="flex items-center gap-4">
					<span class="text-[0.8rem] text-ink-soft">
						{m.admin_products_instance_count({ available: p.available, total: p.total })}
					</span>
					<a
						href={localizeHref('/admin/produkty/' + p.slug)}
						class="text-[0.85rem] text-accent-dark hover:underline"
					>
						{m.admin_edit()}
					</a>
				</div>
			</li>
		{/each}
	</ul>
{/if}
