<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { OrderStatus } from '$lib/orders';

	let { status }: { status: OrderStatus } = $props();

	const label = $derived(
		status === 'resolved'
			? m.admin_order_status_resolved()
			: status === 'cancelled'
				? m.admin_order_status_cancelled()
				: m.admin_order_status_new()
	);
</script>

<span
	class="inline-block rounded-full px-2.5 py-0.5 text-[0.72rem] font-medium tracking-[0.04em] uppercase"
	class:bg-sage={status === 'resolved'}
	class:text-white={status === 'resolved'}
	class:bg-line={status === 'cancelled'}
	class:text-ink-soft={status === 'cancelled'}
	class:bg-accent={status === 'new'}
	class:text-bg={status === 'new'}
>
	{label}
</span>
