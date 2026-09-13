<script lang="ts">
	// Admin order list (REQ-ADMIN-020). Lists every reservation newest-first with
	// its reference/date, buyer name, item count, total and status, and links
	// each row to its detail page.
	import { listOrders, itemCount, type Order } from '$lib/orders';
	import { m } from '$lib/paraglide/messages';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import OrderStatusBadge from './OrderStatusBadge.svelte';

	let orders = $state<Order[]>([]);
	let loading = $state(true);
	let error = $state(false);

	$effect(() => {
		let cancelled = false;
		loading = true;
		error = false;
		listOrders()
			.then((result) => {
				if (!cancelled) orders = result;
			})
			.catch(() => {
				if (!cancelled) error = true;
			})
			.finally(() => {
				if (!cancelled) loading = false;
			});
		return () => {
			cancelled = true;
		};
	});

	function formatDate(iso: string): string {
		if (!iso) return '—';
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return '—';
		return d.toLocaleDateString(getLocale(), {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{m.admin_orders_heading()} · {m.admin_title()}</title>
</svelte:head>

<header class="mb-6 flex flex-col gap-1">
	<h1 class="text-[1.6rem]">{m.admin_orders_heading()}</h1>
	<p class="text-[0.9rem] text-ink-soft">{m.admin_orders_intro()}</p>
</header>

{#if loading}
	<p class="py-10 text-center text-ink-soft">{m.admin_loading()}</p>
{:else if error}
	<p class="py-10 text-center text-accent-dark">{m.admin_orders_error()}</p>
{:else if orders.length === 0}
	<p class="py-10 text-center text-ink-soft">{m.admin_orders_empty()}</p>
{:else}
	<div class="overflow-x-auto rounded-[4px] border border-line bg-white">
		<table class="w-full border-collapse text-[0.9rem]">
			<thead>
				<tr
					class="border-b border-line text-left text-[0.75rem] tracking-[0.08em] text-ink-soft uppercase"
				>
					<th class="px-4 py-3 font-medium">{m.admin_orders_col_reference()}</th>
					<th class="px-4 py-3 font-medium">{m.admin_orders_col_date()}</th>
					<th class="px-4 py-3 font-medium">{m.admin_orders_col_buyer()}</th>
					<th class="px-4 py-3 font-medium">{m.admin_orders_col_items()}</th>
					<th class="px-4 py-3 font-medium">{m.admin_orders_col_total()}</th>
					<th class="px-4 py-3 font-medium">{m.admin_orders_col_status()}</th>
				</tr>
			</thead>
			<tbody>
				{#each orders as order (order.id)}
					<tr class="border-b border-line transition-colors last:border-b-0 hover:bg-bg-alt">
						<td class="px-4 py-3">
							<a
								href={localizeHref('/admin/objednavky/' + order.id)}
								class="font-medium text-accent-dark hover:underline"
							>
								{order.reference}
							</a>
						</td>
						<td class="px-4 py-3 text-ink-soft">{formatDate(order.createdAt)}</td>
						<td class="px-4 py-3">{order.contact.name || '—'}</td>
						<td class="px-4 py-3 text-ink-soft">
							{m.admin_orders_items_count({ count: itemCount(order) })}
						</td>
						<td class="px-4 py-3">{m.price_czk({ amount: order.total })}</td>
						<td class="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
