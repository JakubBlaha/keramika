<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { deLocalizeHref, getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/state';
	import { cart } from '$lib/cart.svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { adminHint } from '$lib/adminHint.svelte';

	let menuOpen = $state(false);

	// Lift the header off the page (shadow) once content scrolls beneath it.
	let scrollY = $state(0);
	const scrolled = $derived(scrollY > 8);

	// Current nav section; product detail pages belong to "Products".
	const path = $derived(deLocalizeHref(page.url.pathname));
	function isCurrent(href: string): boolean {
		return (
			path === href ||
			path.startsWith(href + '/') ||
			(href === '/produkty' && path.startsWith('/produkt/'))
		);
	}

	const nav = $derived([
		{ label: m.nav_home(), href: '/' },
		{ label: m.nav_products(), href: '/produkty' },
		{ label: m.nav_gallery(), href: '/galerie' },
		{ label: m.nav_about(), href: '/o-nas' },
		{ label: m.nav_contact(), href: '/kontakt' }
	]);

	// The locale the switcher should point to (the "other" language) and the
	// current page path so switching keeps the visitor on the same page.
	const otherLocale = $derived(getLocale() === 'cs' ? 'en' : 'cs');
	const switchLabel = $derived(
		getLocale() === 'cs' ? m.lang_switch_to_en() : m.lang_switch_to_cs()
	);
	const switchHref = $derived(localizeHref(page.url.pathname, { locale: otherLocale }));

	// Admin shortcut (REQ-ADMIN-024). The Firebase-backed session module is
	// only loaded when this browser has previously seen an admin session (see
	// $lib/adminHint.svelte.ts), so regular visitors never download it. Hidden
	// inside the admin area, which has its own navigation.
	let isAdmin = $state(false);
	const showAdmin = $derived(adminHint.present && isAdmin && !path.startsWith('/admin'));

	$effect(() => {
		if (!adminHint.present) return;
		let cancelled = false;
		let unsubscribe: (() => void) | undefined;
		import('$lib/adminAuth').then(({ subscribeAdminSession }) => {
			if (cancelled) return;
			unsubscribe = subscribeAdminSession((s) => (isAdmin = s.isAdmin));
		});
		return () => {
			cancelled = true;
			unsubscribe?.();
		};
	});
</script>

{#snippet adminIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.6"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z" />
		<path d="M9 12l2 2 4-4" />
	</svg>
{/snippet}

<svelte:window bind:scrollY />

<header
	class={[
		'sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-md transition-shadow duration-500 [view-transition-name:site-header]',
		scrolled && 'shadow-[0_0.5rem_1.5rem_-1rem_rgb(61_53_48/0.35)]'
	]}
>
	<div
		class="mx-auto grid max-w-site grid-cols-[2.5rem_1fr_2.5rem] items-center px-4 py-3 lg:grid-cols-3"
	>
		<div class="flex items-center gap-1">
			<button
				class="group inline-flex h-10 w-10 cursor-pointer flex-col justify-center gap-[5px] border-none bg-transparent p-2 lg:hidden"
				aria-label={m.a11y_menu()}
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
			>
				<span
					class="block h-px w-full bg-ink transition-transform duration-200 ease-in"
					class:translate-y-[6.5px]={menuOpen}
					class:rotate-45={menuOpen}
				></span>
				<span
					class="block h-px w-full bg-ink transition-opacity duration-200 ease-in"
					class:opacity-0={menuOpen}
				></span>
				<span
					class="block h-px w-full bg-ink transition-transform duration-200 ease-in"
					class:-translate-y-[6.5px]={menuOpen}
					class:-rotate-45={menuOpen}
				></span>
			</button>

			<!-- Desktop inline nav -->
			<nav class="hidden items-center gap-6 lg:flex">
				{#each nav as item (item.href)}
					<a
						href={localizeHref(item.href)}
						class="link-underline text-[0.9rem] tracking-[0.04em] transition-colors hover:text-accent-dark aria-[current=page]:text-accent-dark"
						aria-current={isCurrent(item.href) ? 'page' : undefined}>{item.label}</a
					>
				{/each}
			</nav>
		</div>

		<a
			href={localizeHref('/')}
			class="flex flex-col items-center leading-none"
			onclick={() => (menuOpen = false)}
		>
			<span class="font-display text-[1.15rem] font-medium tracking-[0.02em]">{m.brand_name()}</span
			>
			<span class="mt-0.5 text-[0.6rem] tracking-[0.35em] text-accent uppercase"
				>{m.brand_tagline()}</span
			>
		</a>

		<div class="flex items-center justify-end gap-3">
			{#if showAdmin}
				<a
					href={localizeHref('/admin')}
					class="hidden animate-pop items-center gap-1.5 rounded-full bg-accent-dark px-3 py-1.5 text-[0.75rem] font-medium tracking-[0.08em] text-bg uppercase shadow-[0_0.4rem_1rem_-0.5rem_rgb(61_53_48/0.6)] transition-colors hover:bg-ink lg:inline-flex"
				>
					{@render adminIcon()}
					{m.nav_admin()}
				</a>
			{/if}

			<!-- Language switcher with a globe icon so it reads as a language selector -->
			<a
				href={switchHref}
				class="hidden items-center gap-1.5 text-[0.8rem] tracking-[0.06em] text-accent-dark transition-colors hover:text-ink lg:inline-flex"
				data-sveltekit-reload
				aria-label={switchLabel}
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.4"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="9" />
					<path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
				</svg>
				<span class="uppercase">{otherLocale}</span>
			</a>

			<a
				href={localizeHref('/cart')}
				class="relative inline-flex items-center justify-end text-ink"
				aria-label={m.a11y_cart()}
			>
				<svg
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.4"
				>
					<path d="M6 6h15l-1.5 9h-12z" />
					<circle cx="9" cy="20" r="1.4" />
					<circle cx="18" cy="20" r="1.4" />
					<path d="M6 6L5 3H2" />
				</svg>
				{#if cart.count > 0}
					{#key cart.count}
						<span
							class="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 animate-pop items-center justify-center rounded-full bg-accent-dark px-1 text-[0.6rem] leading-none text-bg"
						>
							{cart.count}
						</span>
					{/key}
				{/if}
			</a>
		</div>
	</div>

	{#if menuOpen}
		<!-- Dim the rest of the page while the mobile menu is open. -->
		<button
			class="fixed inset-0 top-[var(--header-h,3.75rem)] z-40 cursor-default border-none bg-ink/40 lg:hidden"
			aria-label={m.a11y_menu_close()}
			transition:fade={{ duration: 200 }}
			onclick={() => (menuOpen = false)}
		></button>

		<nav
			class="absolute inset-x-0 top-full z-50 flex flex-col border-t border-line bg-bg py-2 lg:hidden"
			transition:slide={{ duration: 250 }}
		>
			{#if showAdmin}
				<a
					href={localizeHref('/admin')}
					class="mx-4 mt-2 mb-3 flex items-center justify-center gap-2 rounded-full bg-accent-dark px-6 py-3 text-[0.85rem] font-medium tracking-[0.08em] text-bg uppercase"
					onclick={() => (menuOpen = false)}
				>
					{@render adminIcon()}
					{m.nav_admin()}
				</a>
			{/if}
			{#each nav as item, i (item.href)}
				<a
					href={localizeHref(item.href)}
					class="border-b border-line px-6 py-[0.85rem] text-[0.95rem] tracking-[0.04em] aria-[current=page]:text-accent-dark"
					aria-current={isCurrent(item.href) ? 'page' : undefined}
					in:fly|global={{ x: -12, duration: 400, delay: 60 + i * 50 }}
					onclick={() => (menuOpen = false)}>{item.label}</a
				>
			{/each}
			<a
				href={switchHref}
				class="flex items-center gap-2 border-b border-line px-6 py-[0.85rem] text-[0.95rem] tracking-[0.04em] text-accent last:border-b-0"
				data-sveltekit-reload
				onclick={() => (menuOpen = false)}
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.4"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="9" />
					<path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
				</svg>
				{switchLabel}</a
			>
		</nav>
	{/if}
</header>
