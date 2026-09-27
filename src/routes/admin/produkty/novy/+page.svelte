<script lang="ts">
	// Admin new-product form (REQ-ADMIN-006). Creates a product with the
	// required fields (name, category, price, and localized cs/en copy); it
	// then appears in the product list and on the public site under its
	// category once the catalog reads from Firestore.
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { fetchCategories, createProduct, AdminApiError } from '$lib/adminApi';
	import type { CategoryRecord } from '$lib/catalog-model';

	let categories = $state<CategoryRecord[]>([]);
	let loadingCategories = $state(true);

	let slug = $state('');
	let categorySlug = $state('');
	let nameCs = $state('');
	let nameEn = $state('');
	let metaCs = $state('');
	let metaEn = $state('');
	let descCs = $state('');
	let descEn = $state('');
	let careCs = $state('');
	let careEn = $state('');
	let price = $state('');
	let size = $state('');

	let saving = $state(false);
	let formError = $state('');

	const locale = $derived(getLocale());

	$effect(() => {
		fetchCategories()
			.then((cats) => {
				categories = cats;
				if (!categorySlug && cats[0]) categorySlug = cats[0].slug;
			})
			.finally(() => (loadingCategories = false));
	});

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (saving) return;
		saving = true;
		formError = '';
		try {
			const created = await createProduct({
				slug: slug.trim(),
				categorySlug,
				name: { cs: nameCs.trim(), en: nameEn.trim() },
				meta: { cs: metaCs.trim(), en: metaEn.trim() },
				description: { cs: descCs.trim(), en: descEn.trim() },
				care: { cs: careCs.trim(), en: careEn.trim() },
				price: String(price).trim(),
				size: size.trim()
			});
			await goto(localizeHref(resolve('/admin/produkty/[slug]', { slug: created.slug })));
		} catch (err) {
			formError = err instanceof AdminApiError ? err.message : m.admin_catalog_save_error();
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>{m.admin_products_new_heading()} · {m.admin_title()}</title>
</svelte:head>

<a
	href={localizeHref('/admin/produkty')}
	class="mb-4 inline-block text-[0.85rem] text-accent-dark hover:underline"
>
	{m.admin_products_back()}
</a>

<h1 class="mb-6 text-[1.6rem]">{m.admin_products_new_heading()}</h1>

<form class="flex max-w-2xl flex-col gap-4" onsubmit={onSubmit}>
	<div class="grid gap-4 sm:grid-cols-2">
		<label class="flex flex-col gap-1 text-[0.8rem]">
			<span class="text-ink-soft">{m.admin_field_slug()}</span>
			<input
				required
				bind:value={slug}
				placeholder="andel"
				class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
			/>
		</label>
		<label class="flex flex-col gap-1 text-[0.8rem]">
			<span class="text-ink-soft">{m.admin_field_category()}</span>
			<select
				required
				bind:value={categorySlug}
				disabled={loadingCategories}
				class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
			>
				{#each categories as c (c.slug)}
					<option value={c.slug}>{c.name[locale]}</option>
				{/each}
			</select>
		</label>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
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
			<span class="text-ink-soft">{m.admin_field_meta_cs()}</span>
			<input
				required
				bind:value={metaCs}
				class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
			/>
		</label>
		<label class="flex flex-col gap-1 text-[0.8rem]">
			<span class="text-ink-soft">{m.admin_field_meta_en()}</span>
			<input
				required
				bind:value={metaEn}
				class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
			/>
		</label>
		<label class="flex flex-col gap-1 text-[0.8rem]">
			<span class="text-ink-soft">{m.admin_field_price()}</span>
			<input
				required
				type="number"
				min="0"
				bind:value={price}
				class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
			/>
		</label>
		<label class="flex flex-col gap-1 text-[0.8rem]">
			<span class="text-ink-soft">{m.admin_field_size()}</span>
			<input
				required
				bind:value={size}
				placeholder="12 cm"
				class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
			/>
		</label>
		<label class="flex flex-col gap-1 text-[0.8rem]">
			<span class="text-ink-soft">{m.admin_field_desc_cs()}</span>
			<textarea
				required
				rows="3"
				bind:value={descCs}
				class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
			></textarea>
		</label>
		<label class="flex flex-col gap-1 text-[0.8rem]">
			<span class="text-ink-soft">{m.admin_field_desc_en()}</span>
			<textarea
				required
				rows="3"
				bind:value={descEn}
				class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
			></textarea>
		</label>
		<label class="flex flex-col gap-1 text-[0.8rem]">
			<span class="text-ink-soft">{m.admin_field_care_cs()}</span>
			<textarea
				required
				rows="2"
				bind:value={careCs}
				class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
			></textarea>
		</label>
		<label class="flex flex-col gap-1 text-[0.8rem]">
			<span class="text-ink-soft">{m.admin_field_care_en()}</span>
			<textarea
				required
				rows="2"
				bind:value={careEn}
				class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
			></textarea>
		</label>
	</div>

	{#if formError}
		<p class="text-[0.85rem] text-accent-dark">{formError}</p>
	{/if}

	<button type="submit" class="btn self-start btn-primary disabled:opacity-50" disabled={saving}>
		{saving ? m.admin_saving() : m.admin_products_create_cta()}
	</button>
</form>
