<script lang="ts">
	// Contact page. Email/phone are only decoded + revealed after an explicit
	// click, same click-to-reveal approach as the footer (see
	// src/lib/contact.ts and src/routes/+layout.svelte) to keep the plaintext
	// out of the prerendered HTML and out of scrapers' reach.
	import { m } from '$lib/paraglide/messages';
	import { EMAIL_REVERSED, PHONE_REVERSED, decodeContact, formatPhone } from '$lib/contact';

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
	<header class="mb-8 flex flex-col gap-[0.4rem]">
		<span class="eyebrow">{m.contact_eyebrow()}</span>
		<h1 class="text-[2rem]">{m.contact_heading()}</h1>
		<p class="max-w-[34rem] text-ink-soft">{m.contact_intro()}</p>
	</header>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
		<div class="flex flex-col gap-2 rounded-[4px] border border-line bg-white p-6">
			<h2 class="text-[0.75rem] tracking-[0.1em] text-ink-soft uppercase">
				{m.contact_email_heading()}
			</h2>
			{#if emailRevealed}
				<a href={'mailto:' + email} class="text-[1.05rem] text-accent-dark hover:underline">
					{email}
				</a>
			{:else}
				<button
					type="button"
					class="cursor-pointer self-start border-none bg-transparent p-0 text-left text-[1.05rem] text-accent-dark underline"
					onclick={() => (emailRevealed = true)}
				>
					{m.contact_show_email()}
				</button>
			{/if}
		</div>

		<div class="flex flex-col gap-2 rounded-[4px] border border-line bg-white p-6">
			<h2 class="text-[0.75rem] tracking-[0.1em] text-ink-soft uppercase">
				{m.contact_phone_heading()}
			</h2>
			{#if phoneRevealed}
				<a href={'tel:' + phone} class="text-[1.05rem] text-accent-dark hover:underline">
					{formatPhone(phone)}
				</a>
			{:else}
				<button
					type="button"
					class="cursor-pointer self-start border-none bg-transparent p-0 text-left text-[1.05rem] text-accent-dark underline"
					onclick={() => (phoneRevealed = true)}
				>
					{m.contact_show_phone()}
				</button>
			{/if}
		</div>

		<div class="flex flex-col gap-2 rounded-[4px] border border-line bg-white p-6">
			<h2 class="text-[0.75rem] tracking-[0.1em] text-ink-soft uppercase">
				{m.contact_location_heading()}
			</h2>
			<p class="text-[0.95rem] text-ink-soft">{m.contact_location_text()}</p>
		</div>
	</div>
</section>
