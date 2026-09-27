<script lang="ts">
	// "Back to …" link with a left-arrow icon, used at the top of admin detail
	// pages. The arrow nudges left on hover.
	import type { Snippet } from 'svelte';

	let { href, children }: { href: string; children: Snippet } = $props();
</script>

<a
	{href}
	class="group mb-4 inline-flex items-center gap-1.5 text-[0.85rem] text-accent-dark hover:underline"
>
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
		class="transition-transform duration-300 ease-(--ease-soft) group-hover:-translate-x-0.5"
	>
		<path d="M19 12H5M11 6l-6 6 6 6" />
	</svg>
	{@render children()}
</a>
