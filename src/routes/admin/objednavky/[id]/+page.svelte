<script lang="ts">
	// Admin order detail (REQ-ADMIN-021) with status actions (REQ-ADMIN-022).
	// Shows the buyer's contact details, the reserved instances with titles and
	// prices, the total, the date and the current status, and lets the admin
	// mark the order as resolved or cancelled.
	import { page } from '$app/state';
	import { getOrder, setOrderStatus, type Order, type OrderStatus } from '$lib/orders';
	import { m } from '$lib/paraglide/messages';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import OrderStatusBadge from '../OrderStatusBadge.svelte';
	import MailIcon from '$lib/components/MailIcon.svelte';
	import PhoneIcon from '$lib/components/PhoneIcon.svelte';

	const id = $derived(page.params.id ?? '');

	let order = $state<Order | null>(null);
	let loading = $state(true);
	let error = $state(false);
	let notFound = $state(false);
	// Which status action is in flight, so both buttons can disable during a save.
	let saving = $state<OrderStatus | null>(null);
	let saveError = $state(false);

	$effect(() => {
		const currentId = id;
		let cancelled = false;
		loading = true;
		error = false;
		notFound = false;
		getOrder(currentId)
			.then((result) => {
				if (cancelled) return;
				if (result) order = result;
				else notFound = true;
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
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function updateStatus(status: OrderStatus) {
		if (!order || saving) return;
		saving = status;
		saveError = false;
		try {
			await setOrderStatus(order.id, status);
			order = { ...order, status };
		} catch {
			saveError = true;
		} finally {
			saving = null;
		}
	}
</script>

<svelte:head>
	<title>
		{order ? order.reference : m.admin_order_heading()} · {m.admin_title()}
	</title>
</svelte:head>

<a
	href={localizeHref('/admin/objednavky')}
	class="mb-6 inline-block text-[0.85rem] text-ink-soft transition-colors hover:text-accent-dark"
>
	&larr; {m.admin_order_back()}
</a>

{#if loading}
	<p class="py-10 text-center text-ink-soft">{m.admin_loading()}</p>
{:else if error}
	<p class="py-10 text-center text-accent-dark">{m.admin_order_error()}</p>
{:else if notFound || !order}
	<p class="py-10 text-center text-ink-soft">{m.admin_order_not_found()}</p>
{:else}
	<article class="flex flex-col gap-6">
		<header class="flex flex-wrap items-start justify-between gap-3">
			<div class="flex flex-col gap-1">
				<h1 class="text-[1.6rem]">{m.admin_order_heading()} {order.reference}</h1>
				<span class="text-[0.9rem] text-ink-soft">{formatDate(order.createdAt)}</span>
			</div>
			<OrderStatusBadge status={order.status} />
		</header>

		<!-- Buyer contact details -->
		<section class="rounded-[4px] border border-line bg-white p-5">
			<h2 class="mb-3 text-[0.75rem] tracking-[0.1em] text-ink-soft uppercase">
				{m.admin_order_contact_heading()}
			</h2>
			<dl class="grid gap-2 text-[0.9rem] sm:grid-cols-3">
				<div class="flex flex-col">
					<dt class="text-ink-soft">{m.admin_order_contact_name()}</dt>
					<dd>{order.contact.name || '—'}</dd>
				</div>
				<div class="flex flex-col">
					<dt class="text-ink-soft">{m.admin_order_contact_email()}</dt>
					<dd>
						{#if order.contact.email}
							<a
								href={'mailto:' + order.contact.email}
								class="inline-flex items-center gap-1.5 text-accent-dark hover:underline"
							>
								<MailIcon />
								{order.contact.email}
							</a>
						{:else}
							—
						{/if}
					</dd>
				</div>
				<div class="flex flex-col">
					<dt class="text-ink-soft">{m.admin_order_contact_phone()}</dt>
					<dd>
						{#if order.contact.phone}
							<a
								href={'tel:' + order.contact.phone}
								class="inline-flex items-center gap-1.5 text-accent-dark hover:underline"
							>
								<PhoneIcon />
								{order.contact.phone}
							</a>
						{:else}
							—
						{/if}
					</dd>
				</div>
			</dl>
		</section>

		<!-- Reserved instances -->
		<section class="rounded-[4px] border border-line bg-white">
			<h2
				class="border-b border-line px-5 py-4 text-[0.75rem] tracking-[0.1em] text-ink-soft uppercase"
			>
				{m.admin_order_items_heading()}
			</h2>
			<ul>
				{#each order.items as item (item.instanceId)}
					<li
						class="flex items-center justify-between gap-4 border-b border-line px-5 py-3 text-[0.9rem] last:border-b-0"
					>
						<div class="flex flex-col">
							<span class="font-medium">{item.title}</span>
							<span class="text-[0.8rem] text-ink-soft">{item.label} · {item.instanceId}</span>
						</div>
						<span>{m.price_czk({ amount: item.price })}</span>
					</li>
				{/each}
			</ul>
			<div class="flex items-center justify-between px-5 py-4 text-[0.95rem] font-medium">
				<span>{m.admin_order_total()}</span>
				<span>{m.price_czk({ amount: order.total })}</span>
			</div>
		</section>

		<!-- Status actions (REQ-ADMIN-022) -->
		<section class="flex flex-col gap-3 rounded-[4px] border border-line bg-white p-5">
			<h2 class="text-[0.75rem] tracking-[0.1em] text-ink-soft uppercase">
				{m.admin_order_actions_heading()}
			</h2>
			<div class="flex flex-wrap gap-3">
				<button
					type="button"
					class="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
					disabled={saving !== null || order.status === 'resolved'}
					onclick={() => updateStatus('resolved')}
				>
					{saving === 'resolved' ? m.admin_saving() : m.admin_order_mark_resolved()}
				</button>
				<button
					type="button"
					class="btn border border-line text-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
					disabled={saving !== null || order.status === 'cancelled'}
					onclick={() => updateStatus('cancelled')}
				>
					{saving === 'cancelled' ? m.admin_saving() : m.admin_order_mark_cancelled()}
				</button>
			</div>
			{#if saveError}
				<p class="text-[0.85rem] text-accent-dark">{m.admin_order_save_error()}</p>
			{/if}
			<p class="text-[0.8rem] text-ink-soft">{m.admin_order_cancel_hint()}</p>
		</section>
	</article>
{/if}
