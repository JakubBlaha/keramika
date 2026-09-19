<script lang="ts">
	// Admin category edit/delete (REQ-ADMIN-015, REQ-ADMIN-016). Loads a single
	// category, lets the admin change its slug and localized name/description,
	// and delete it. Deleting a category that still has products is blocked by
	// the API (409); the message is surfaced here.
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { fetchCategory, updateCategory, deleteCategory, AdminApiError } from '$lib/adminApi';

	const originalSlug = $derived(page.params.slug ?? '');

	let loading = $state(true);
	let loadError = $state(false);

	let slug = $state('');
	let nameCs = $state('');
	let nameEn = $state('');
	let descCs = $state('');
	let descEn = $state('');

	let saving = $state(false);
	let deleting = $state(false);
	let formError = $state('');
	let saved = $state(false);

	$effect(() => {
		const s = originalSlug;
		loading = true;
		loadError = false;
		fetchCategory(s)
			.then((c) => {
				slug = c.slug;
				nameCs = c.name.cs;
				nameEn = c.name.en;
				descCs = c.description.cs;
				descEn = c.description.en;
			})
			.catch(() => (loadError = true))
			.finally(() => (loading = false));
	});

	async function onSave(event: SubmitEvent) {
		event.preventDefault();
		if (saving) return;
		saving = true;
		formError = '';
		saved = false;
		try {
			await updateCategory(originalSlug, {
				slug: slug.trim(),
				name: { cs: nameCs.trim(), en: nameEn.trim() },
				description: { cs: descCs.trim(), en: descEn.trim() }
			});
			saved = true;
			// If the slug changed, its document id changed too; go to the new URL.
			if (slug.trim() !== originalSlug) {
				await goto(localizeHref(resolve('/admin/kategorie/[slug]', { slug: slug.trim() })));
			}
		} catch (err) {
			formError = err instanceof AdminApiError ? err.message : m.admin_catalog_save_error();
		} finally {
			saving = false;
		}
	}

	async function onDelete() {
		if (deleting) return;
		if (!confirm(m.admin_categories_delete_confirm())) return;
		deleting = true;
		formError = '';
		try {
			await deleteCategory(originalSlug);
			await goto(localizeHref(resolve('/admin/kategorie')));
		} catch (err) {
			formError = err instanceof AdminApiError ? err.message : m.admin_catalog_save_error();
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>{m.admin_categories_edit_heading()} · {m.admin_title()}</title>
</svelte:head>

<a
	href={localizeHref('/admin/kategorie')}
	class="mb-4 inline-block text-[0.85rem] text-accent-dark hover:underline"
>
	{m.admin_categories_back()}
</a>

{#if loading}
	<p class="py-10 text-center text-ink-soft">{m.admin_loading()}</p>
{:else if loadError}
	<p class="py-10 text-center text-accent-dark">{m.admin_categories_not_found()}</p>
{:else}
	<h1 class="mb-6 text-[1.6rem]">{m.admin_categories_edit_heading()}</h1>

	<form class="flex max-w-lg flex-col gap-4" onsubmit={onSave}>
		<label class="flex flex-col gap-1 text-[0.8rem]">
			<span class="text-ink-soft">{m.admin_field_slug()}</span>
			<input
				required
				bind:value={slug}
				class="rounded-[4px] border border-line px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
			/>
		</label>
		<div class="grid gap-4 sm:grid-cols-2">
			<label class="flex flex-col gap-1 text-[0.8rem]">
				<span class="text-ink-soft">{m.admin_field_name_cs()}</span>
				<input
					required
					bind:value={nameCs}
					class="rounded-[4px] border border-line px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
				/>
			</label>
			<label class="flex flex-col gap-1 text-[0.8rem]">
				<span class="text-ink-soft">{m.admin_field_name_en()}</span>
				<input
					required
					bind:value={nameEn}
					class="rounded-[4px] border border-line px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
				/>
			</label>
			<label class="flex flex-col gap-1 text-[0.8rem]">
				<span class="text-ink-soft">{m.admin_field_desc_cs()}</span>
				<textarea
					required
					rows="3"
					bind:value={descCs}
					class="rounded-[4px] border border-line px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
				></textarea>
			</label>
			<label class="flex flex-col gap-1 text-[0.8rem]">
				<span class="text-ink-soft">{m.admin_field_desc_en()}</span>
				<textarea
					required
					rows="3"
					bind:value={descEn}
					class="rounded-[4px] border border-line px-3 py-2 text-[0.9rem] focus:border-accent focus:outline-none"
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
				onclick={onDelete}
			>
				{deleting ? m.admin_saving() : m.admin_delete()}
			</button>
		</div>
	</form>
{/if}
