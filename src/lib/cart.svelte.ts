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

	// Stack of recently removed lines (with the index they were removed from) so
	// the cart page can offer a multi-step undo (REQ-CART-005). Not persisted:
	// undo is only meaningful within the current session/page.
	#removed = $state<{ line: CartLine; index: number }[]>([]);

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

	// Remove an instance from the cart (REQ-CART-005), remembering where it was
	// so it can be restored via undo().
	remove(instanceId: string): void {
		const index = this.lines.findIndex((l) => l.instanceId === instanceId);
		if (index === -1) return;
		const [line] = this.lines.splice(index, 1);
		this.lines = [...this.lines];
		this.#removed = [...this.#removed, { line, index }];
		this.#persist();
	}

	// Whether there is a removal that can be undone.
	get canUndo(): boolean {
		return this.#removed.length > 0;
	}

	// Restore the most recently removed line to its original position. Can be
	// called repeatedly to undo multiple removals in a row.
	undo(): void {
		const last = this.#removed.at(-1);
		if (!last) return;
		this.#removed = this.#removed.slice(0, -1);
		// Skip if the instance was re-added in the meantime.
		if (this.has(last.line.instanceId)) return;
		const next = [...this.lines];
		next.splice(Math.min(last.index, next.length), 0, last.line);
		this.lines = next;
		this.#persist();
	}

	clear(): void {
		this.lines = [];
		this.#removed = [];
		this.#persist();
	}

	get count(): number {
		return this.lines.length;
	}
}

// Single shared instance used across the app (header badge, product page,
// cart page).
export const cart = new CartStore();
