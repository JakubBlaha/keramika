<script lang="ts">
	// Contact page. Email/phone are only decoded + revealed after an explicit
	// click, same click-to-reveal approach as the footer (see
	// src/lib/contact.ts and src/routes/+layout.svelte) to keep the plaintext
	// out of the prerendered HTML and out of scrapers' reach.
	//
	// The reveal buttons stretch their click area over the whole card (an
	// absolutely positioned ::after), so clicking anywhere on the card reveals
	// the detail (REQ-CONTENT-003) while the button stays the single
	// focusable control.
	import { m } from '$lib/paraglide/messages';
	import { EMAIL_REVERSED, PHONE_REVERSED, decodeContact, formatPhone } from '$lib/contact';
	import MailIcon from '$lib/components/MailIcon.svelte';
	import PhoneIcon from '$lib/components/PhoneIcon.svelte';

	let emailRevealed = $state(false);
	let phoneRevealed = $state(false);

	const email = $derived(decodeContact(EMAIL_REVERSED));
	const phone = $derived(decodeContact(PHONE_REVERSED));
</script>

<svelte:head>
	<title>{m.contact_title()}</title>
	<meta name="description" content={m.contact_meta_description()} />
</svelte:head>

<section class="mx-auto max-w-site px-4 pt-10 pb-16">
	<header class="mb-8 flex rise-children flex-col gap-[0.4rem]">
		<span class="eyebrow">{m.contact_eyebrow()}</span>
		<h1 class="text-[2rem]">{m.contact_heading()}</h1>
		<p class="max-w-[34rem] text-ink-soft">{m.contact_intro()}</p>
	</header>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
		<div
			class="relative flex animate-rise flex-col gap-2 rounded-[4px] border border-line bg-white p-6 transition-[border-color,box-shadow] duration-300 hover:border-accent/50 hover:shadow-[0_1rem_2rem_-1.5rem_rgb(61_53_48/0.35)]"
			style:animation-delay="250ms"
		>
			<h2 class="text-[0.75rem] tracking-[0.1em] text-ink-soft uppercase">
				{m.contact_email_heading()}
			</h2>
			{#if emailRevealed}
				<a
					href={'mailto:' + email}
					class="inline-flex items-center gap-1.5 text-[1.05rem] text-accent-dark hover:underline"
				>
					<MailIcon />
					{email}
				</a>
			{:else}
				<button
					type="button"
					class="inline-flex cursor-pointer items-center gap-1.5 self-start border-none bg-transparent p-0 text-left text-[1.05rem] text-accent-dark underline after:absolute after:inset-0 after:rounded-[4px] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent"
					onclick={() => (emailRevealed = true)}
				>
					<MailIcon />
					{m.contact_show_email()}
				</button>
			{/if}
		</div>

		<div
			class="relative flex animate-rise flex-col gap-2 rounded-[4px] border border-line bg-white p-6 transition-[border-color,box-shadow] duration-300 hover:border-accent/50 hover:shadow-[0_1rem_2rem_-1.5rem_rgb(61_53_48/0.35)]"
			style:animation-delay="350ms"
		>
			<h2 class="text-[0.75rem] tracking-[0.1em] text-ink-soft uppercase">
				{m.contact_phone_heading()}
			</h2>
			{#if phoneRevealed}
				<a
					href={'tel:' + phone}
					class="inline-flex items-center gap-1.5 text-[1.05rem] text-accent-dark hover:underline"
				>
					<PhoneIcon />
					{formatPhone(phone)}
				</a>
			{:else}
				<button
					type="button"
					class="inline-flex cursor-pointer items-center gap-1.5 self-start border-none bg-transparent p-0 text-left text-[1.05rem] text-accent-dark underline after:absolute after:inset-0 after:rounded-[4px] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent"
					onclick={() => (phoneRevealed = true)}
				>
					<PhoneIcon />
					{m.contact_show_phone()}
				</button>
			{/if}
		</div>

		<div
			class="flex animate-rise flex-col gap-2 rounded-[4px] border border-line bg-white p-6 transition-[border-color,box-shadow] duration-300 hover:border-accent/50 hover:shadow-[0_1rem_2rem_-1.5rem_rgb(61_53_48/0.35)]"
			style:animation-delay="450ms"
		>
			<h2 class="text-[0.75rem] tracking-[0.1em] text-ink-soft uppercase">
				{m.contact_location_heading()}
			</h2>
			<p class="text-[0.95rem] text-ink-soft">{m.contact_location_text()}</p>
		</div>
	</div>
</section>
