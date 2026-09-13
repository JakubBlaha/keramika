<script lang="ts">
	import Header from './Header.svelte';
	import './layout.css';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<Header />
	<main class="w-full flex-1">{@render children()}</main>

	<footer class="mt-16 bg-ink text-bg">
		<div class="mx-auto flex max-w-site flex-col gap-10 px-4 py-10">
			<div class="flex flex-col gap-1">
				<span class="font-display text-2xl">{m.brand_name()}</span>
				<span class="text-[0.8rem] tracking-[0.12em] text-accent uppercase"
					>{m.brand_tagline_full()}</span
				>
			</div>

			<div class="flex flex-col gap-6 sm:flex-row sm:justify-between">
				<div class="flex flex-col gap-2">
					<h4 class="mb-1 font-body text-[0.72rem] tracking-[0.2em] text-accent uppercase">
						{m.footer_col_shop()}
					</h4>
					<a
						href={localizeHref('/produkty')}
						class="text-[0.9rem] text-[#d8cfc4] transition-colors hover:text-white"
						>{m.footer_link_all_products()}</a
					>
					<a
						href={localizeHref('/produkty/andele')}
						class="text-[0.9rem] text-[#d8cfc4] transition-colors hover:text-white"
						>{m.footer_link_angels()}</a
					>
					<a
						href={localizeHref('/produkty/zviratka')}
						class="text-[0.9rem] text-[#d8cfc4] transition-colors hover:text-white"
						>{m.footer_link_animals()}</a
					>
					<a
						href={localizeHref('/produkty/postavicky')}
						class="text-[0.9rem] text-[#d8cfc4] transition-colors hover:text-white"
						>{m.footer_link_figures()}</a
					>
				</div>
				<div class="flex flex-col gap-2">
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
					<a
						href={localizeHref('/ochrana-osobnich-udaju')}
						class="text-[0.9rem] text-[#d8cfc4] transition-colors hover:text-white"
						>{m.footer_link_privacy()}</a
					>
					<a
						href={localizeHref('/reklamace')}
						class="text-[0.9rem] text-[#d8cfc4] transition-colors hover:text-white"
						>{m.footer_link_complaints()}</a
					>
				</div>
				<div class="flex flex-col gap-2">
					<h4 class="mb-1 font-body text-[0.72rem] tracking-[0.2em] text-accent uppercase">
						{m.footer_col_contact()}
					</h4>
					<a
						href="mailto:ahoj@ladakeramika.cz"
						class="text-[0.9rem] text-[#d8cfc4] transition-colors hover:text-white"
						>ahoj@ladakeramika.cz</a
					>
					<a
						href="tel:+420776384159"
						class="text-[0.9rem] text-[#d8cfc4] transition-colors hover:text-white"
						>+420 776 384 159</a
					>
					<span class="text-[0.9rem] text-[#d8cfc4]">{m.footer_location()}</span>
				</div>
			</div>

			<div class="flex gap-6 text-[0.82rem] tracking-[0.14em] uppercase">
				<a
					href="https://instagram.com"
					class="text-[#d8cfc4] hover:text-white"
					aria-label="Instagram">Instagram</a
				>
				<a href="https://facebook.com" class="text-[#d8cfc4] hover:text-white" aria-label="Facebook"
					>Facebook</a
				>
			</div>

			<p class="border-t border-white/10 pt-6 text-[0.78rem] text-[#9a8f83]">
				{m.footer_copy({ year: new Date().getFullYear() })}
			</p>
		</div>
	</footer>
</div>
