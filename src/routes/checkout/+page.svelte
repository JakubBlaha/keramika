<script lang="ts">
	// Checkout / reservation page (REQ-CHECKOUT-001..010). The site has no
	// online payment or shipping: fulfillment is pickup in store and payment
	// happens in store on pickup, so submitting this form places a
	// *reservation*, not a paid order (REQ-CHECKOUT-007..009).
	import { cart } from '$lib/cart.svelte';
	import { coverImage } from '$lib/catalog';
	import type { Product, ProductInstance } from '$lib/catalog';
	import { placeOrder, type OrderItem } from '$lib/orders';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { data } = $props();

	type ResolvedLine = {
		instance: ProductInstance;
		product: Product;
	};

	// Same cart-resolution approach as /cart: lines whose product/instance no
	// longer exists are skipped rather than crashing the page.
	const resolvedLines = $derived(
		cart.lines
			.map((line): ResolvedLine | null => {
				const product = data.products.find((p) => p.slug === line.productSlug);
				const instance = product?.instances.find((i) => i.id === line.instanceId);
				if (!product || !instance) return null;
				return { instance, product };
			})
			.filter((l): l is ResolvedLine => l !== null)
	);

	const isEmpty = $derived(resolvedLines.length === 0);

	function unitPrice(line: ResolvedLine): number {
		return Number(line.instance.price ?? line.product.price);
	}

	// Pickup in store is the only fulfillment method (REQ-CHECKOUT-007), so
	// there is no shipping cost.
	const total = $derived(resolvedLines.reduce((sum, l) => sum + unitPrice(l), 0));

	// Contact form fields (REQ-CHECKOUT-002).
	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let termsAccepted = $state(false);

	// Per-field validation errors, populated on submit attempt.
	let nameError = $state(false);
	let emailError = $state(false);
	let phoneError = $state(false);
	let termsError = $state(false);
	let submitError = $state(false);
	let submitting = $state(false);

	// Result of a successful submission (REQ-CHECKOUT-006, REQ-CHECKOUT-010).
	let confirmation = $state<{ reference: string } | null>(null);

	const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	function validate(): boolean {
		nameError = name.trim().length === 0;
		emailError = email.trim().length === 0 || !EMAIL_RE.test(email.trim());
		phoneError = phone.trim().length === 0;
		termsError = !termsAccepted;
		return !nameError && !emailError && !phoneError && !termsError;
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		submitError = false;
		if (!validate()) return;
		if (isEmpty) return;

		submitting = true;
		try {
			const items: OrderItem[] = resolvedLines.map((l) => ({
				instanceId: l.instance.id,
				title: l.product.name,
				label: l.instance.label,
				price: String(unitPrice(l))
			}));
			const { id } = await placeOrder({
				contact: { name: name.trim(), email: email.trim(), phone: phone.trim() },
				items,
				total: String(total)
			});
			cart.clear();
			confirmation = { reference: id };
		} catch {
			submitError = true;
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>{confirmation ? m.checkout_confirmation_title() : m.checkout_title()}</title>
	<meta name="description" content={m.checkout_meta_description()} />
</svelte:head>

<section class="mx-auto max-w-site px-4 pt-10 pb-16">
	{#if confirmation}
		<!-- Order confirmation (REQ-CHECKOUT-006) -->
		<div class="flex flex-col items-start gap-4 border-y border-line py-10">
			<h1 class="text-[2rem]">{m.checkout_confirmation_heading()}</h1>
			<p class="max-w-prose text-ink-soft">
				{m.checkout_confirmation_text({ reference: confirmation.reference })}
			</p>
			<a href={localizeHref('/produkty')} class="btn btn-primary">
				{m.checkout_confirmation_back_cta()}
			</a>
		</div>
	{:else}
		<header class="mb-8 flex rise-children flex-col gap-[0.4rem]">
			<span class="eyebrow">{m.checkout_eyebrow()}</span>
			<h1 class="text-[2rem]">{m.checkout_heading()}</h1>
		</header>

		{#if isEmpty}
			<div class="flex flex-col items-start gap-4 border-y border-line py-10">
				<p class="text-ink-soft">{m.checkout_empty_text()}</p>
				<a href={localizeHref('/produkty')} class="btn btn-primary">
					{m.checkout_empty_cta()}
				</a>
			</div>
		{:else}
			<div class="flex flex-col gap-10 md:flex-row md:gap-10">
				<!-- Contact form + notices -->
				<form class="flex flex-1 flex-col gap-8" onsubmit={submit}>
					<!-- Contact information (REQ-CHECKOUT-002) -->
					<fieldset class="flex flex-col gap-4">
						<h2 class="text-[1.15rem] font-medium">{m.checkout_contact_heading()}</h2>

						<div class="flex flex-col gap-1">
							<label for="checkout-name" class="text-[0.85rem] text-ink-soft"
								>{m.checkout_contact_name()}</label
							>
							<input
								id="checkout-name"
								type="text"
								required
								bind:value={name}
								class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.95rem] outline-none focus:border-accent"
								aria-invalid={nameError}
							/>
							{#if nameError}
								<span class="text-[0.8rem] text-accent-dark">{m.checkout_field_required()}</span>
							{/if}
						</div>

						<div class="flex flex-col gap-1">
							<label for="checkout-email" class="text-[0.85rem] text-ink-soft"
								>{m.checkout_contact_email()}</label
							>
							<input
								id="checkout-email"
								type="email"
								required
								bind:value={email}
								class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.95rem] outline-none focus:border-accent"
								aria-invalid={emailError}
							/>
							{#if emailError}
								<span class="text-[0.8rem] text-accent-dark"
									>{email.trim().length === 0
										? m.checkout_field_required()
										: m.checkout_field_email_invalid()}</span
								>
							{/if}
						</div>

						<div class="flex flex-col gap-1">
							<label for="checkout-phone" class="text-[0.85rem] text-ink-soft"
								>{m.checkout_contact_phone()}</label
							>
							<input
								id="checkout-phone"
								type="tel"
								required
								bind:value={phone}
								class="rounded-[4px] border border-line bg-white px-3 py-2 text-[0.95rem] outline-none focus:border-accent"
								aria-invalid={phoneError}
							/>
							{#if phoneError}
								<span class="text-[0.8rem] text-accent-dark">{m.checkout_field_required()}</span>
							{/if}
						</div>
					</fieldset>

					<!-- Pickup in store is the only fulfillment method (REQ-CHECKOUT-007) -->
					<div class="flex flex-col gap-1 rounded-[4px] bg-bg-alt p-4">
						<h2 class="text-[0.95rem] font-medium">{m.checkout_fulfillment_heading()}</h2>
						<p class="text-[0.85rem] text-ink-soft">{m.checkout_fulfillment_text()}</p>
					</div>

					<!-- Payment in store on pickup is the only payment method (REQ-CHECKOUT-008) -->
					<div class="flex flex-col gap-1 rounded-[4px] bg-bg-alt p-4">
						<h2 class="text-[0.95rem] font-medium">{m.checkout_payment_heading()}</h2>
						<p class="text-[0.85rem] text-ink-soft">{m.checkout_payment_text()}</p>
					</div>

					<!-- Reservation, not a paid sale (REQ-CHECKOUT-009) -->
					<p class="text-[0.85rem] text-ink-soft">{m.checkout_reservation_notice()}</p>

					<!-- Terms acceptance (REQ-CHECKOUT-005) -->
					<div class="flex flex-col gap-1">
						<label class="flex items-start gap-2 text-[0.9rem]">
							<input
								type="checkbox"
								required
								bind:checked={termsAccepted}
								class="mt-1"
								aria-invalid={termsError}
							/>
							<span>
								{m.checkout_terms_label({ terms: '' })}
								<a
									href={localizeHref('/obchodni-podminky')}
									class="text-accent-dark hover:underline"
								>
									{m.checkout_terms_link()}
								</a>
							</span>
						</label>
						{#if termsError}
							<span class="text-[0.8rem] text-accent-dark">{m.checkout_terms_required()}</span>
						{/if}
					</div>

					{#if submitError}
						<p class="text-[0.9rem] text-accent-dark">{m.checkout_submit_error()}</p>
					{/if}

					<button
						type="submit"
						class="btn self-start btn-primary disabled:cursor-not-allowed disabled:opacity-50"
						disabled={submitting}
					>
						{submitting ? m.checkout_submitting() : m.checkout_submit_cta()}
					</button>
				</form>

				<!-- Order summary (REQ-CHECKOUT-001) -->
				<aside class="flex flex-col gap-4 rounded-[4px] bg-bg-alt p-6 md:w-80">
					<h2 class="text-[1.15rem] font-medium">{m.checkout_summary_heading()}</h2>
					<ul class="flex flex-col divide-y divide-line border-y border-line">
						{#each resolvedLines as line (line.instance.id)}
							<li class="flex items-center gap-3 py-3">
								<div class="aspect-square w-14 shrink-0 overflow-hidden rounded-[4px] bg-white">
									<img
										src={line.instance.images[0] ?? coverImage(line.product)}
										alt={line.product.name}
										class="h-full w-full object-cover"
										loading="lazy"
									/>
								</div>
								<div class="flex flex-1 flex-col gap-[0.1rem]">
									<span class="text-[0.9rem] font-medium">{line.product.name}</span>
									<span class="text-[0.78rem] text-ink-soft">
										{m.product_instance_label({ label: line.instance.label })}
									</span>
								</div>
								<span class="text-[0.9rem] text-accent-dark">
									{m.price_czk({ amount: String(unitPrice(line)) })}
								</span>
							</li>
						{/each}
					</ul>
					<div class="flex justify-between border-t border-line pt-2 text-[1rem] font-medium">
						<span>{m.cart_summary_total()}</span>
						<span class="text-accent-dark">{m.price_czk({ amount: String(total) })}</span>
					</div>
				</aside>
			</div>
		{/if}
	{/if}
</section>
