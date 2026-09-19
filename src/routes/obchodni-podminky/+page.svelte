<script lang="ts">
	// Placeholder terms & conditions page. Linked from checkout (the terms
	// acceptance checkbox, REQ-CHECKOUT-005) and from the footer. Real legal
	// copy is still to be written (see docs/TODO.md section 8); this exists so
	// the link target isn't a 404.
	import { m } from '$lib/paraglide/messages';
</script>

<svelte:head>
	<title>{m.terms_title()}</title>
	<meta name="description" content={m.terms_meta_description()} />
</svelte:head>

<article class="mx-auto max-w-site px-4 pt-10 pb-16">
	<header class="mb-8 flex flex-col gap-[0.4rem]">
		<span class="eyebrow">{m.terms_eyebrow()}</span>
		<h1 class="text-[2rem]">{m.terms_heading()}</h1>
	</header>

	<div class="flex max-w-prose flex-col gap-4 text-ink-soft">
		<p>{m.terms_placeholder_text()}</p>
		<p>{m.terms_reservation_note()}</p>
	</div>
</article>
