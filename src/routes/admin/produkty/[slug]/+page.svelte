<script lang="ts">
	// Admin product edit page (REQ-ADMIN-007, REQ-ADMIN-008) and its instance
	// management (REQ-ADMIN-009..012, REQ-ADMIN-019). Loads one product with its
	// instances, lets the admin edit/delete the product, and add/edit/delete
	// instances including uploading their images to Firebase Storage.
	import { page } from '$app/state';
	import { gotoLocalized } from '$lib/navigation';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import BackLink from '$lib/components/BackLink.svelte';
	import {
		fetchProduct,
		fetchCategories,
		updateProduct,
		deleteProduct,
		createInstance,
		updateInstance,
		deleteInstance,
		uploadInstanceImages,
		AdminApiError
	} from '$lib/adminApi';
	import type { CategoryRecord, InstanceRecord } from '$lib/catalog-model';

	const slug = $derived(page.params.slug ?? '');
	const locale = $derived(getLocale());

	let loading = $state(true);
	let loadError = $state(false);
	let categories = $state<CategoryRecord[]>([]);
	let instances = $state<InstanceRecord[]>([]);

	// Product fields.
	let currentSlug = $state('');
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
	let deleting = $state(false);
	let formError = $state('');
	let saved = $state(false);

	async function load() {
		loading = true;
		loadError = false;
		try {
			const [product, cats] = await Promise.all([fetchProduct(slug), fetchCategories()]);
			categories = cats;
			currentSlug = product.slug;
			categorySlug = product.categorySlug;
			nameCs = product.name.cs;
			nameEn = product.name.en;
			metaCs = product.meta.cs;
			metaEn = product.meta.en;
			descCs = product.description.cs;
			descEn = product.description.en;
			careCs = product.care.cs;
			careEn = product.care.en;
			price = product.price;
			size = product.size;
			instances = product.instances;
		} catch {
			loadError = true;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		void slug;
		load();
	});

	async function onSave(event: SubmitEvent) {
		event.preventDefault();
		if (saving) return;
		saving = true;
		formError = '';
		saved = false;
		try {
			await updateProduct(slug, {
				slug: currentSlug.trim(),
				categorySlug,
				name: { cs: nameCs.trim(), en: nameEn.trim() },
				meta: { cs: metaCs.trim(), en: metaEn.trim() },
				description: { cs: descCs.trim(), en: descEn.trim() },
				care: { cs: careCs.trim(), en: careEn.trim() },
				price: String(price).trim(),
				size: size.trim()
			});
			saved = true;
			if (currentSlug.trim() !== slug) {
				await gotoLocalized(resolve('/admin/produkty/[slug]', { slug: currentSlug.trim() }));
			}
		} catch (err) {
			formError = err instanceof AdminApiError ? err.message : m.admin_catalog_save_error();
		} finally {
			saving = false;
		}
	}

	async function onDeleteProduct() {
		if (deleting) return;
		if (!confirm(m.admin_products_delete_confirm())) return;
		deleting = true;
		formError = '';
		try {
			await deleteProduct(slug);
			await gotoLocalized(resolve('/admin/produkty'));
		} catch (err) {
			formError = err instanceof AdminApiError ? err.message : m.admin_catalog_save_error();
		} finally {
			deleting = false;
		}
	}

	// --- Instances ---------------------------------------------------------

	let newLabel = $state('');
	let newPrice = $state('');
	let newFiles = $state<FileList | null>(null);
	let creatingInstance = $state(false);
	let instanceError = $state('');

	function nextInstanceId(): string {
		const n = instances.length + 1;
		return `${slug}-${String(n).padStart(2, '0')}`;
	}

	async function onCreateInstance(event: SubmitEvent) {
		event.preventDefault();
		if (creatingInstance) return;
		creatingInstance = true;
		instanceError = '';
		try {
			const id = nextInstanceId();
			let images: string[] = [];
			if (newFiles && newFiles.length > 0) {
				images = await uploadInstanceImages(slug, id, Array.from(newFiles));
			}
			const created = await createInstance(slug, {
				id,
				label: newLabel.trim(),
				images,
				available: true,
				...(String(newPrice).trim() ? { price: String(newPrice).trim() } : {})
			});
			instances = [...instances, created];
			newLabel = '';
			newPrice = '';
			newFiles = null;
		} catch (err) {
			instanceError = err instanceof AdminApiError ? err.message : m.admin_catalog_save_error();
		} finally {
			creatingInstance = false;
		}
	}

	let savingInstanceId = $state<string | null>(null);
	let uploadingInstanceId = $state<string | null>(null);

	async function toggleAvailable(instance: InstanceRecord) {
		savingInstanceId = instance.id;
		instanceError = '';
		try {
			const updated = await updateInstance(slug, instance.id, {
				...instance,
				available: !instance.available
			});
			instances = instances.map((i) => (i.id === instance.id ? updated : i));
		} catch (err) {
			instanceError = err instanceof AdminApiError ? err.message : m.admin_catalog_save_error();
		} finally {
			savingInstanceId = null;
		}
	}

	async function onAddImages(instance: InstanceRecord, files: FileList | null) {
		if (!files || files.length === 0) return;
		uploadingInstanceId = instance.id;
		instanceError = '';
		try {
			const urls = await uploadInstanceImages(slug, instance.id, Array.from(files));
			const updated = await updateInstance(slug, instance.id, {
				...instance,
				images: [...instance.images, ...urls]
			});
			instances = instances.map((i) => (i.id === instance.id ? updated : i));
		} catch (err) {
			instanceError = err instanceof AdminApiError ? err.message : m.admin_catalog_save_error();
		} finally {
			uploadingInstanceId = null;
		}
	}

	let deletingInstanceId = $state<string | null>(null);

	async function onDeleteInstance(instance: InstanceRecord) {
		if (deletingInstanceId) return;
		if (!confirm(m.admin_instances_delete_confirm())) return;
		deletingInstanceId = instance.id;
		instanceError = '';
		try {
			await deleteInstance(slug, instance.id);
			instances = instances.filter((i) => i.id !== instance.id);
		} catch (err) {
			instanceError = err instanceof AdminApiError ? err.message : m.admin_catalog_save_error();
		} finally {
			deletingInstanceId = null;
		}
	}
</script>

<svelte:head>
	<title>{m.admin_products_edit_heading()} · {m.admin_title()}</title>
</svelte:head>

<BackLink href={localizeHref('/admin/produkty')}>{m.admin_products_back()}</BackLink>

{#if loading}
	<p class="py-10 text-center text-ink-soft">{m.admin_loading()}</p>
{:else if loadError}
	<p class="py-10 text-center text-accent-dark">{m.admin_products_not_found()}</p>
{:else}
	<h1 class="mb-6 text-[1.6rem]">{m.admin_products_edit_heading()}</h1>

	<form class="mb-12 flex max-w-2xl flex-col gap-4" onsubmit={onSave}>
		<div class="grid gap-4 sm:grid-cols-2">
			<label class="flex flex-col gap-1 text-[0.8rem]">
				<span class="text-ink-soft">{m.admin_field_slug()}</span>
				<input
					required
					bind:value={currentSlug}
					class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
				/>
			</label>
			<label class="flex flex-col gap-1 text-[0.8rem]">
				<span class="text-ink-soft">{m.admin_field_category()}</span>
				<select
					required
					bind:value={categorySlug}
					class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
				>
					{#each categories as c (c.slug)}
						<option value={c.slug}>{c.name[locale]}</option>
					{/each}
				</select>
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
		{:else if saved}
			<p class="text-[0.85rem] text-sage">{m.admin_saved()}</p>
		{/if}

		<div class="flex items-center gap-3">
			<button type="submit" class="btn btn-primary disabled:opacity-50" disabled={saving}>
				{saving ? m.admin_saving() : m.admin_save()}
			</button>
			<button
				type="button"
				class="text-[0.85rem] text-accent-dark hover:underline disabled:opacity-50"
				disabled={deleting}
				onclick={onDeleteProduct}
			>
				{deleting ? m.admin_saving() : m.admin_delete()}
			</button>
		</div>
	</form>

	<!-- Instances (REQ-ADMIN-009..012, REQ-ADMIN-019) -->
	<section class="max-w-2xl">
		<h2 class="mb-4 text-[1.2rem]">{m.admin_instances_heading()}</h2>

		{#if instanceError}
			<p class="mb-4 text-[0.85rem] text-accent-dark">{instanceError}</p>
		{/if}

		{#if instances.length === 0}
			<p class="mb-6 text-[0.85rem] text-ink-soft">{m.admin_instances_empty()}</p>
		{:else}
			<ul class="mb-6 flex flex-col divide-y divide-line rounded-[4px] border border-line bg-white">
				{#each instances as instance (instance.id)}
					<li class="flex flex-col gap-2 px-4 py-3">
						<div class="flex items-center justify-between gap-4">
							<div class="flex items-center gap-3">
								{#if instance.images[0]}
									<img
										src={instance.images[0]}
										alt={instance.label}
										class="h-12 w-12 rounded-[4px] object-cover"
									/>
								{:else}
									<div class="h-12 w-12 rounded-[4px] bg-bg-alt"></div>
								{/if}
								<div class="flex flex-col">
									<span class="font-medium">{instance.label}</span>
									<span class="text-[0.75rem] text-ink-soft">{instance.id}</span>
								</div>
							</div>
							<div class="flex items-center gap-3">
								<button
									type="button"
									class="rounded-full px-2 py-0.5 text-[0.7rem] tracking-[0.06em] uppercase disabled:opacity-50"
									class:bg-sage={instance.available}
									class:text-white={instance.available}
									class:bg-bg-alt={!instance.available}
									class:text-ink-soft={!instance.available}
									disabled={savingInstanceId === instance.id}
									onclick={() => toggleAvailable(instance)}
								>
									{instance.available ? m.admin_instances_available() : m.admin_instances_sold()}
								</button>
								<button
									type="button"
									class="text-[0.8rem] text-accent-dark hover:underline disabled:opacity-50"
									disabled={deletingInstanceId === instance.id}
									onclick={() => onDeleteInstance(instance)}
								>
									{m.admin_delete()}
								</button>
							</div>
						</div>
						<label class="flex items-center gap-2 text-[0.78rem] text-ink-soft">
							<span>{m.admin_instances_add_images()}</span>
							<input
								type="file"
								accept="image/*"
								multiple
								disabled={uploadingInstanceId === instance.id}
								onchange={(e) => onAddImages(instance, e.currentTarget.files)}
							/>
							{#if uploadingInstanceId === instance.id}
								<span>{m.admin_saving()}</span>
							{/if}
						</label>
					</li>
				{/each}
			</ul>
		{/if}

		<form
			class="flex flex-col gap-3 rounded-[4px] border border-line bg-white p-4 sm:flex-row sm:items-end sm:gap-4"
			onsubmit={onCreateInstance}
		>
			<label class="flex flex-1 flex-col gap-1 text-[0.8rem]">
				<span class="text-ink-soft">{m.admin_field_label()}</span>
				<input
					required
					bind:value={newLabel}
					placeholder="#1"
					class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
				/>
			</label>
			<label class="flex flex-1 flex-col gap-1 text-[0.8rem]">
				<span class="text-ink-soft">{m.admin_field_price_override()}</span>
				<input
					bind:value={newPrice}
					type="number"
					min="0"
					class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
				/>
			</label>
			<label class="flex flex-1 flex-col gap-1 text-[0.8rem]">
				<span class="text-ink-soft">{m.admin_field_images()}</span>
				<input
					type="file"
					accept="image/*"
					multiple
					onchange={(e) => (newFiles = e.currentTarget.files)}
				/>
			</label>
			<button type="submit" class="btn btn-primary disabled:opacity-50" disabled={creatingInstance}>
				{creatingInstance ? m.admin_saving() : m.admin_instances_create_cta()}
			</button>
		</form>
	</section>
{/if}
