<script lang="ts">
	// Admin category management (REQ-ADMIN-013, REQ-ADMIN-014). Lists every
	// category with its slug, localized name and product count, and offers an
	// inline form to create a new category (localized cs/en name + description).
	import { m } from '$lib/paraglide/messages';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { fetchCategories, fetchProducts, createCategory, AdminApiError } from '$lib/adminApi';
	import type { CategoryRecord } from '$lib/catalog-model';

	let categories = $state<CategoryRecord[]>([]);
	let productCounts = $state<Record<string, number>>({});
	let loading = $state(true);
	let error = $state(false);

	// New-category form state.
	let slug = $state('');
	let nameCs = $state('');
	let nameEn = $state('');
	let descCs = $state('');
	let descEn = $state('');
	let saving = $state(false);
	let formError = $state('');

	const locale = $derived(getLocale());

	async function load() {
		loading = true;
		error = false;
		try {
			const [cats, products] = await Promise.all([fetchCategories(), fetchProducts()]);
			categories = cats;
			const counts: Record<string, number> = {};
			for (const p of products) counts[p.categorySlug] = (counts[p.categorySlug] ?? 0) + 1;
			productCounts = counts;
		} catch {
			error = true;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		load();
	});

	async function onCreate(event: SubmitEvent) {
		event.preventDefault();
		if (saving) return;
		saving = true;
		formError = '';
		try {
			await createCategory({
				slug: slug.trim(),
				name: { cs: nameCs.trim(), en: nameEn.trim() },
				description: { cs: descCs.trim(), en: descEn.trim() }
			});
			slug = nameCs = nameEn = descCs = descEn = '';
			await load();
		} catch (err) {
			formError = err instanceof AdminApiError ? err.message : m.admin_catalog_save_error();
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>{m.admin_categories_heading()} · {m.admin_title()}</title>
</svelte:head>

<header class="mb-8 flex flex-col gap-[0.4rem]">
	<h1 class="text-[1.6rem]">{m.admin_categories_heading()}</h1>
	<p class="text-[0.9rem] text-ink-soft">{m.admin_categories_intro()}</p>
</header>

<div class="flex flex-col gap-10 lg:flex-row lg:items-start">
	<!-- List -->
	<div class="flex-1">
		{#if loading}
			<p class="py-10 text-center text-ink-soft">{m.admin_loading()}</p>
		{:else if error}
			<p class="py-10 text-center text-accent-dark">{m.admin_catalog_load_error()}</p>
		{:else if categories.length === 0}
			<p class="py-10 text-center text-ink-soft">{m.admin_categories_empty()}</p>
		{:else}
			<ul class="flex flex-col divide-y divide-line rounded-[4px] border border-line bg-white">
				{#each categories as c (c.slug)}
					<li class="flex items-center justify-between gap-4 px-4 py-3">
						<div class="flex flex-col">
							<span class="font-medium">{c.name[locale]}</span>
							<span class="text-[0.8rem] text-ink-soft">{c.slug}</span>
						</div>
						<div class="flex items-center gap-4">
							<span class="text-[0.8rem] text-ink-soft">
								{m.admin_categories_product_count({ count: productCounts[c.slug] ?? 0 })}
							</span>
							<a
								href={localizeHref('/admin/kategorie/' + c.slug)}
								class="text-[0.85rem] text-accent-dark hover:underline"
							>
								{m.admin_edit()}
							</a>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<!-- Create form -->
	<form
		class="flex w-full flex-col gap-4 rounded-[4px] border border-line bg-white p-5 lg:w-80"
		onsubmit={onCreate}
	>
		<h2 class="text-[1.1rem] font-medium">{m.admin_categories_new_heading()}</h2>

		<label class="flex flex-col gap-1 text-[0.8rem]">
			<span class="text-ink-soft">{m.admin_field_slug()}</span>
			<input
				required
				bind:value={slug}
				placeholder="andele"
				class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
			/>
		</label>
		<label class="flex flex-col gap-1 text-[0.8rem]">
			<span class="text-ink-soft">{m.admin_field_name_cs()}</span>
			<input
				required
				bind:value={nameCs}
				class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
			/>
		</label>
		<label class="flex flex-col gap-1 text-[0.8rem]">
			<span class="text-ink-soft">{m.admin_field_name_en()}</span>
			<input
				required
				bind:value={nameEn}
				class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
			/>
		</label>
		<label class="flex flex-col gap-1 text-[0.8rem]">
			<span class="text-ink-soft">{m.admin_field_desc_cs()}</span>
			<textarea
				required
				rows="2"
				bind:value={descCs}
				class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
			></textarea>
		</label>
		<label class="flex flex-col gap-1 text-[0.8rem]">
			<span class="text-ink-soft">{m.admin_field_desc_en()}</span>
			<textarea
				required
				rows="2"
				bind:value={descEn}
				class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
			></textarea>
		</label>

		{#if formError}
			<p class="text-[0.8rem] text-accent-dark">{formError}</p>
		{/if}

		<button type="submit" class="btn btn-primary disabled:opacity-50" disabled={saving}>
			{saving ? m.admin_saving() : m.admin_categories_create_cta()}
		</button>
	</form>
</div>
