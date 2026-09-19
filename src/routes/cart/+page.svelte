<script lang="ts">
	import { cart } from '$lib/cart.svelte';
	import { getProduct, coverImage } from '$lib/catalog';
	import type { Product, ProductInstance } from '$lib/catalog';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

	// Resolve each cart line to its live product/instance data. Lines that
	// reference a product/instance that no longer exists are skipped rather
	// than crashing the page.
	type ResolvedLine = {
		instance: ProductInstance;
		product: Product;
	};

	const resolvedLines = $derived(
		cart.lines
			.map((line): ResolvedLine | null => {
				const found = getProduct(line.productSlug);
				if (!found) return null;
				const instance = found.product.instances.find((i) => i.id === line.instanceId);
				if (!instance) return null;
				return { instance, product: found.product };
			})
			.filter((l): l is ResolvedLine => l !== null)
	);

	const isEmpty = $derived(resolvedLines.length === 0);

	function unitPrice(line: ResolvedLine): number {
		return Number(line.instance.price ?? line.product.price);
	}

	const subtotal = $derived(resolvedLines.reduce((sum, l) => sum + unitPrice(l), 0));
	// Pickup in store is the only fulfillment method (REQ-CHECKOUT-007), so
	// there is no shipping cost.
	const shipping = 0;
	const total = $derived(subtotal + shipping);

	function removeLine(instanceId: string) {
		cart.remove(instanceId);
	}
</script>

<svelte:head>
	<title>{m.cart_title()}</title>
	<meta name="description" content={m.cart_meta_description()} />
</svelte:head>

<section class="mx-auto max-w-site px-4 pt-10 pb-16">
	<header class="mb-8 flex flex-col gap-[0.4rem]">
		<span class="eyebrow">{m.cart_eyebrow()}</span>
		<h1 class="text-[2rem]">{m.cart_heading()}</h1>
	</header>

	{#if isEmpty}
		<div class="flex flex-col items-start gap-4 border-y border-line py-10">
			<p class="text-ink-soft">{m.cart_empty_text()}</p>
			<a href={localizeHref('/produkty')} class="btn btn-primary">
				{m.cart_empty_cta()}
			</a>
		</div>
	{:else}
		<div class="flex flex-col gap-10 md:flex-row md:gap-10">
			<!-- Cart lines -->
			<ul class="flex flex-1 flex-col divide-y divide-line border-y border-line">
				{#each resolvedLines as line (line.instance.id)}
					<li class="flex items-center gap-4 py-4">
						<a
							href={localizeHref('/produkt/' + line.product.slug)}
							class="aspect-square w-20 shrink-0 overflow-hidden rounded-[4px] bg-bg-alt"
						>
							<img
								src={line.instance.images[0] ?? coverImage(line.product)}
								alt={line.product.name()}
								class="h-full w-full object-cover"
								loading="lazy"
							/>
						</a>

						<div class="flex flex-1 flex-col gap-[0.15rem]">
							<a
								href={localizeHref('/produkt/' + line.product.slug)}
								class="font-medium hover:text-accent-dark"
							>
								{line.product.name()}
							</a>
							<span class="text-[0.8rem] text-ink-soft">
								{m.product_instance_label({ label: line.instance.label })} · {line.product.size}
							</span>
							<span class="mt-[0.15rem] text-[0.95rem] text-accent-dark">
								{m.price_czk({ amount: String(unitPrice(line)) })}
							</span>
						</div>

						<button
							type="button"
							class="cursor-pointer border-none bg-transparent p-2 text-ink-soft transition-colors hover:text-accent-dark"
							aria-label={m.cart_remove_line({ title: line.product.name() })}
							onclick={() => removeLine(line.instance.id)}
						>
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.6"
								aria-hidden="true"
							>
								<path d="M6 6l12 12M18 6L6 18" />
							</svg>
						</button>
					</li>
				{/each}
			</ul>

			<!-- Summary -->
			<aside class="flex flex-col gap-4 rounded-[4px] bg-bg-alt p-6 md:w-72">
				<h2 class="text-[1.15rem] font-medium">{m.cart_summary_heading()}</h2>
				<dl class="flex flex-col gap-2 text-[0.9rem]">
					<div class="flex justify-between">
						<dt class="text-ink-soft">{m.cart_summary_subtotal()}</dt>
						<dd>{m.price_czk({ amount: String(subtotal) })}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-ink-soft">{m.cart_summary_shipping()}</dt>
						<dd>{m.cart_summary_shipping_pickup()}</dd>
					</div>
					<div class="flex justify-between border-t border-line pt-2 text-[1rem] font-medium">
						<dt>{m.cart_summary_total()}</dt>
						<dd class="text-accent-dark">{m.price_czk({ amount: String(total) })}</dd>
					</div>
				</dl>
				<a href={localizeHref('/objednavka')} class="mt-2 btn btn-primary text-center">
					{m.cart_checkout_cta()}
				</a>
			</aside>
		</div>
	{/if}
</section>
