<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/state';

	let menuOpen = $state(false);

	const nav = $derived([
		{ label: m.nav_products(), href: '/produkty' },
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
</script>

<header class="sticky top-0 z-50 border-b border-line bg-bg">
	<div class="grid grid-cols-[2.5rem_1fr_2.5rem] items-center px-4 py-3">
		<button
			class="group inline-flex h-10 w-10 cursor-pointer flex-col justify-center gap-[5px] border-none bg-transparent p-2"
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

		<a
			href={localizeHref('/kosik')}
			class="inline-flex items-center justify-end text-ink"
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
		</a>
	</div>

	{#if menuOpen}
		<nav class="flex flex-col border-t border-line py-2">
			{#each nav as item (item.href)}
				<a
					href={localizeHref(item.href)}
					class="border-b border-line px-6 py-[0.85rem] text-[0.95rem] tracking-[0.04em]"
					onclick={() => (menuOpen = false)}>{item.label}</a
				>
			{/each}
			<a
				href={switchHref}
				class="border-b border-line px-6 py-[0.85rem] text-[0.95rem] tracking-[0.04em] text-accent last:border-b-0"
				data-sveltekit-reload
				onclick={() => (menuOpen = false)}>{switchLabel}</a
			>
		</nav>
	{/if}
</header>
