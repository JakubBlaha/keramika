// The public site's view of the catalog, and pure helpers over it.
//
// There are no built-in products: the catalog is read from Firestore on each
// request by src/lib/server/publicCatalog.ts, localized to the request's
// locale, and handed to pages through their server load functions. Copy is
// therefore plain strings here (unlike the stored { cs, en } maps of
// src/lib/catalog-model.ts), and everything is serializable across the load
// boundary.
//
// Domain model: a Product is a "blueprint" (e.g. "Angel"). Because each piece
// is hand made, the actual stock is a set of unique ProductInstances. Each
// instance exists exactly once (available or already sold) and has its own
// photos. The number of still-available instances is the product's availability.

export type ProductInstance = {
	// Unique id for this single physical piece (e.g. "angel-01").
	id: string;
	// Short human label shown to the buyer (e.g. "#1").
	label: string;
	// One or more photos of this exact piece.
	images: string[];
	// Per-instance price override in CZK; falls back to the product price.
	price?: string;
	// False once this single piece has been sold.
	available: boolean;
};

export type Product = {
	slug: string;
	categorySlug: string;
	name: string;
	meta: string;
	// Longer marketing description shown on the detail page.
	description: string;
	// Care instructions shown in an accordion on the detail page.
	care: string;
	// Base price in CZK (used when an instance has no own price).
	price: string;
	// Human-readable dimension/volume, language-neutral (e.g. "14 cm").
	size: string;
	// The unique physical pieces of this blueprint.
	instances: ProductInstance[];
};

export type Category = {
	slug: string;
	name: string;
	description: string;
	products: Product[];
};

export function getCategory(categories: Category[], slug: string): Category | undefined {
	return categories.find((c) => c.slug === slug);
}

export function getProduct(
	categories: Category[],
	slug: string
): { product: Product; category: Category } | undefined {
	for (const category of categories) {
		const product = category.products.find((p) => p.slug === slug);
		if (product) {
			return { product, category };
		}
	}
	return undefined;
}

// Number of still-available unique pieces of a product.
export function availableCount(product: Product): number {
	return product.instances.filter((i) => i.available).length;
}

// Total number of pieces ever made (available + sold).
export function totalCount(product: Product): number {
	return product.instances.length;
}

// The primary image used as the product's thumbnail (first available piece,
// falling back to the very first piece).
export function coverImage(product: Product): string {
	const first = product.instances.find((i) => i.available) ?? product.instances[0];
	return first?.images[0] ?? '';
}

// Up to `limit` other products from the same category (for the "related"
// section on the detail page). Falls back to products from other categories
// if the current category does not have enough.
export function getRelated(categories: Category[], slug: string, limit = 4): Product[] {
	const found = getProduct(categories, slug);
	if (!found) return [];

	const sameCategory = found.category.products.filter((p) => p.slug !== slug);
	if (sameCategory.length >= limit) {
		return sameCategory.slice(0, limit);
	}

	const others = categories
		.filter((c) => c.slug !== found.category.slug)
		.flatMap((c) => c.products);

	return [...sameCategory, ...others].slice(0, limit);
}

// Flat list of every product across all categories.
export function allProducts(categories: Category[]): Product[] {
	return categories.flatMap((c) => c.products);
}
