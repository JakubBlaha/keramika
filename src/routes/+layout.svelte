<script lang="ts">
	import Header from './Header.svelte';
	import './layout.css';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { EMAIL_REVERSED, PHONE_REVERSED, decodeContact, formatPhone } from '$lib/contact';
	import { PUBLIC_FIREBASE_EMULATOR } from '$env/static/public';
	import MailIcon from '$lib/components/MailIcon.svelte';
	import PhoneIcon from '$lib/components/PhoneIcon.svelte';
	import { onNavigate } from '$app/navigation';
	import { prefersReducedMotion } from '$lib/motion';

	let { children } = $props();

	// Cross-fade between pages with the View Transitions API (REQ-DESIGN-007);
	// product images morph between card and detail page via matching
	// view-transition-name. Browsers without the API just navigate.
	onNavigate((navigation) => {
		if (!document.startViewTransition || prefersReducedMotion()) return;
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	// Expose whether the Firebase client is wired to the local emulator so the
	// e2e checkout tests (which submit real reservations) can detect it. No
	// effect in normal use; the flag is empty in production builds.
	$effect(() => {
		document.documentElement.dataset.firebaseEmulator =
			PUBLIC_FIREBASE_EMULATOR === 'true' ? 'true' : 'false';
	});

	// Contact details are only decoded + revealed after an explicit click, so
	// the plaintext never appears in the prerendered HTML (see $lib/contact.ts).
	let emailRevealed = $state(false);
	let phoneRevealed = $state(false);

	const email = $derived(decodeContact(EMAIL_REVERSED));
	const phone = $derived(decodeContact(PHONE_REVERSED));
</script>

<div class="flex min-h-screen flex-col">
	<Header />
	<main class="w-full flex-1">{@render children()}</main>

	<footer class="mt-16 bg-ink text-bg">
		<div class="mx-auto flex max-w-site flex-col divide-y divide-accent/40 px-4 py-10">
			<div class="flex flex-col gap-1 pb-8">
				<span class="font-display text-2xl">{m.brand_name()}</span>
				<span class="text-[0.8rem] tracking-[0.12em] text-accent uppercase"
					>{m.brand_tagline_full()}</span
				>
			</div>

			<div
				class="flex flex-col gap-6 divide-y divide-accent/40 py-8 sm:flex-row sm:justify-between sm:divide-x sm:divide-y-0"
			>
				<div class="flex flex-col gap-2 pb-6 sm:pr-8 sm:pb-0">
					<h4 class="mb-1 font-body text-[0.72rem] tracking-[0.2em] text-accent uppercase">
						{m.footer_col_info()}
					</h4>
					<a
						href={localizeHref('/o-nas')}
						class="text-[0.9rem] text-[#d8cfc4] transition-colors hover:text-white"
						>{m.footer_link_about()}</a
					>
					<a
						href={localizeHref('/obchodni-podminky')}
						class="text-[0.9rem] text-[#d8cfc4] transition-colors hover:text-white"
						>{m.footer_link_terms()}</a
					>
				</div>

				<div class="flex flex-col gap-2 pt-6 sm:pt-0 sm:pl-8">
					<h4 class="mb-1 font-body text-[0.72rem] tracking-[0.2em] text-accent uppercase">
						{m.footer_col_contact()}
					</h4>
					{#if emailRevealed}
						<a
							href={'mailto:' + email}
							class="inline-flex items-center gap-1.5 text-[0.9rem] text-[#d8cfc4] transition-colors hover:text-white"
							><MailIcon />{email}</a
						>
					{:else}
						<button
							type="button"
							class="inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-left text-[0.9rem] text-[#d8cfc4] underline transition-colors hover:text-white"
							onclick={() => (emailRevealed = true)}
						>
							<MailIcon />
							{m.footer_show_email()}
						</button>
					{/if}
					{#if phoneRevealed}
						<a
							href={'tel:' + phone}
							class="inline-flex items-center gap-1.5 text-[0.9rem] text-[#d8cfc4] transition-colors hover:text-white"
							><PhoneIcon />{formatPhone(phone)}</a
						>
					{:else}
						<button
							type="button"
							class="inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-left text-[0.9rem] text-[#d8cfc4] underline transition-colors hover:text-white"
							onclick={() => (phoneRevealed = true)}
						>
							<PhoneIcon />
							{m.footer_show_phone()}
						</button>
					{/if}

					<span class="text-[0.9rem] text-[#d8cfc4]">{m.footer_location()}</span>
				</div>
			</div>

			<p class="pt-6 text-[0.78rem] text-[#9a8f83]">
				{m.footer_copy({ year: new Date().getFullYear() })}
			</p>
		</div>
	</footer>
</div>
