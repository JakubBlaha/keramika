<script lang="ts">
	// Simple phone handset icon used next to phone links/labels across the site.
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
	<path
		d="M6.5 3.5l3 3-2 2.5c.7 1.9 2.1 3.6 3.5 5s3.1 2.8 5 3.5l2.5-2 3 3-1.7 1.7c-.7.7-1.8.9-2.7.5-3-1.3-5.6-3.1-7.8-5.3S6.6 10.7 5.3 7.7c-.4-.9-.2-2 .5-2.7z"
	/>
</svg>
