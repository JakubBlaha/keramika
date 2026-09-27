<script lang="ts">
	// Simple envelope icon used next to email links/labels across the site.
	let { size = 16, class: className = '' }: { size?: number; class?: string } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.4"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	class={className}
>
	<rect x="3" y="5" width="18" height="14" rx="2" />
	<path d="M3.5 6.5l8.5 6 8.5-6" />
</svg>
