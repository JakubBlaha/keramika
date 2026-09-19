// Client-side cart store (Svelte 5 runes). See docs/requirements/cart.md.
//
// The cart only ever references instances by id + their product slug; the
// product/instance data itself (image, title, size, price) is resolved live
// from the catalog (src/lib/catalog.ts) whenever the cart is rendered. This
// keeps the cart free of stale/duplicated copy and matches how the product
// detail page already resolves data from a language-neutral slug.
//
// Because each instance is a unique physical piece (REQ-CATALOG-002), a cart
// line has an implicit quantity of one and an instance can only ever appear
// once in the cart (REQ-CART-004, REQ-CART-006).
//
// State is persisted to localStorage so the cart survives reloads/navigation.
// This module is browser-only in effect: it no-ops (empty cart) during
// SSR/prerender, matching the guard style used by $lib/firebase.ts.

import { browser } from '$app/environment';

export type CartLine = {
	// Id of the unique physical piece (ProductInstance.id).
	instanceId: string;
	// Slug of the product the instance belongs to, needed to resolve it.
	productSlug: string;
};

const STORAGE_KEY = 'keramika-cart';

function loadInitial(): CartLine[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(l): l is CartLine =>
				l &&
				typeof l === 'object' &&
				typeof l.instanceId === 'string' &&
				typeof l.productSlug === 'string'
		);
	} catch {
		return [];
	}
}

class CartStore {
	lines = $state<CartLine[]>(loadInitial());

	#persist() {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.lines));
		} catch {
			// Ignore storage failures (e.g. private mode / quota) - the cart just
			// won't survive a reload, which is an acceptable degradation.
		}
	}

	// Whether an instance is already in the cart (REQ-CART-004).
	has(instanceId: string): boolean {
		return this.lines.some((l) => l.instanceId === instanceId);
	}

	// Add an instance once; adding an already-present instance is a no-op.
	add(instanceId: string, productSlug: string): void {
		if (this.has(instanceId)) return;
		this.lines = [...this.lines, { instanceId, productSlug }];
		this.#persist();
	}

	// Remove an instance from the cart (REQ-CART-005).
	remove(instanceId: string): void {
		this.lines = this.lines.filter((l) => l.instanceId !== instanceId);
		this.#persist();
	}

	clear(): void {
		this.lines = [];
		this.#persist();
	}

	get count(): number {
		return this.lines.length;
	}
}

// Single shared instance used across the app (header badge, product page,
// cart page).
export const cart = new CartStore();
