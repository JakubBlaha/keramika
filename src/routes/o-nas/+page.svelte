<script lang="ts">
	// About page (REQ-HOME-004 links here from the homepage teaser, and the
	// header nav + footer both link here as "O mně" / "About me").
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { reveal } from '$lib/motion';

	const values = [
		{ title: m.value_love_title(), text: m.value_love_text() },
		{ title: m.value_motifs_title(), text: m.value_motifs_text() },
		{ title: m.value_original_title(), text: m.value_original_text() }
	];
</script>

<svelte:head>
	<title>{m.about_page_title()}</title>
	<meta name="description" content={m.about_page_meta_description()} />
</svelte:head>

<header
	class="mx-auto flex max-w-site rise-children flex-col gap-[0.4rem] px-4 pt-10 pb-6 md:pt-16"
>
	<span class="eyebrow">{m.about_eyebrow()}</span>
	<h1 class="text-[2.6rem] font-medium md:text-[3.4rem]">{m.about_heading()}</h1>
</header>

<article class="mx-auto flex max-w-site flex-col gap-16 px-4 pb-16">
	<!-- Story -->
	<section class="flex flex-col gap-4" {@attach reveal()}>
		<h2 class="text-[1.6rem]">{m.about_page_story_heading()}</h2>
		<p class="max-w-prose text-ink-soft">{m.about_page_story_text_1()}</p>
		<p class="max-w-prose text-ink-soft">{m.about_page_story_text_2()}</p>
	</section>

	<!-- Process -->
	<section class="flex flex-col gap-4 rounded-[4px] bg-bg-alt p-6" {@attach reveal()}>
		<h2 class="text-[1.6rem]">{m.about_page_process_heading()}</h2>
		<p class="max-w-prose text-ink-soft">{m.about_page_process_text()}</p>
	</section>

	<!-- Values -->
	<section class="flex flex-col gap-6">
		<h2 class="text-[1.6rem]">{m.about_page_values_heading()}</h2>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
			{#each values as v (v.title)}
				<div class="flex flex-col gap-[0.4rem] border-t border-accent/40 pt-4" {@attach reveal()}>
					<h3 class="text-[1.15rem] font-medium">{v.title}</h3>
					<p class="text-[0.95rem] text-ink-soft">{v.text}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- CTA -->
	<section class="flex flex-col gap-3 border-t border-line pt-10" {@attach reveal()}>
		<h2 class="text-[1.4rem]">{m.about_page_cta_heading()}</h2>
		<p class="text-ink-soft">{m.about_page_cta_text()}</p>
		<a href={localizeHref('/produkty')} class="btn self-start btn-primary">{m.hero_cta()}</a>
	</section>
</article>
