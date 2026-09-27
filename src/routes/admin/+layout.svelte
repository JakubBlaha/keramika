<script lang="ts">
	// Admin area shell and auth gate (REQ-ADMIN-002, REQ-ADMIN-004, REQ-ADMIN-017).
	//
	// Every admin page is wrapped by this layout. Until an authenticated admin
	// is present it renders only the login form, so no admin content or actions
	// are exposed to unauthenticated or non-admin visitors. When an admin is
	// signed in it renders the admin chrome (nav + logout) and the page content.
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { subscribeAdminSession, adminLogout, type AdminSession } from '$lib/adminAuth';
	import AdminLogin from './AdminLogin.svelte';

	let { children } = $props();

	let session = $state<AdminSession>({
		loading: true,
		user: null,
		isAdmin: false,
		error: false
	});
	let loggingOut = $state(false);

	$effect(() => subscribeAdminSession((s) => (session = s)));

	async function onLogout() {
		if (loggingOut) return;
		loggingOut = true;
		try {
			await adminLogout();
		} finally {
			loggingOut = false;
		}
	}
</script>

<div class="min-h-screen bg-bg">
	{#if session.loading}
		<p class="py-20 text-center text-ink-soft">{m.admin_loading()}</p>
	{:else if session.error}
		<p class="mx-auto max-w-[34rem] px-4 py-20 text-center text-accent-dark" role="alert">
			{m.admin_config_error()}
		</p>
	{:else if !session.user || !session.isAdmin}
		<main class="mx-auto max-w-site px-4 py-8">
			<AdminLogin notAdmin={!!session.user && !session.isAdmin} />
		</main>
	{:else}
		<header class="border-b border-line bg-white">
			<div class="mx-auto flex max-w-site items-center justify-between px-4 py-4">
				<a href={localizeHref('/admin')} class="flex flex-col leading-tight">
					<span class="font-display text-lg">{m.admin_title()}</span>
					<span class="text-[0.72rem] tracking-[0.18em] text-ink-soft uppercase">
						{m.admin_subtitle()}
					</span>
				</a>
				<div class="flex items-center gap-5 text-[0.9rem]">
					<nav class="flex gap-4">
						<a
							href={localizeHref('/admin')}
							class="text-ink-soft transition-colors hover:text-accent-dark"
						>
							{m.admin_nav_dashboard()}
						</a>
						<a
							href={localizeHref('/admin/produkty')}
							class="text-ink-soft transition-colors hover:text-accent-dark"
						>
							{m.admin_nav_products()}
						</a>
						<a
							href={localizeHref('/admin/kategorie')}
							class="text-ink-soft transition-colors hover:text-accent-dark"
						>
							{m.admin_nav_categories()}
						</a>
						<a
							href={localizeHref('/admin/objednavky')}
							class="text-ink-soft transition-colors hover:text-accent-dark"
						>
							{m.admin_nav_orders()}
						</a>
					</nav>
					<button
						type="button"
						class="text-ink-soft transition-colors hover:text-accent-dark disabled:opacity-50"
						disabled={loggingOut}
						onclick={onLogout}
					>
						{loggingOut ? m.admin_logout_pending() : m.admin_logout()}
					</button>
				</div>
			</div>
		</header>

		<main class="mx-auto max-w-site px-4 py-8">{@render children()}</main>
	{/if}
</div>
