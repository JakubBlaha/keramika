import { m } from '$lib/paraglide/messages';

// Placeholder catalog data. No backend yet - this drives the category and
// product listing/detail pages. Names/descriptions go through Paraglide
// messages so they stay translatable. The `slug` is the language-neutral URL
// segment. Language-neutral data (price, size, images) lives here directly.
//
// Domain model: a Product is a "blueprint" (e.g. "Angel"). Because each piece
// is hand made, the actual stock is a set of unique ProductInstances. Each
// instance exists exactly once (available or already sold) and has its own
// photos. The number of still-available instances is the product's availability.
//
// Images live under static/products/<product>/<instance>/<file> and are served
// from /products/<product>/<instance>/<file>.

export type ProductInstance = {
	// Unique id for this single physical piece (e.g. "angel-01").
	id: string;
	// Short human label shown to the buyer (e.g. "#1").
	label: string;
	// One or more photos of this exact piece (served from /products/...).
	images: string[];
	// Per-instance price override in CZK; falls back to the product price.
	price?: string;
	// False once this single piece has been sold.
	available: boolean;
};

export type Product = {
	slug: string;
	name: () => string;
	meta: () => string;
	// Longer marketing description shown on the detail page.
	description: () => string;
	// Care instructions shown in an accordion on the detail page.
	care: () => string;
	// Base price in CZK (used when an instance has no own price).
	price: string;
	// Human-readable dimension/volume, language-neutral (e.g. "14 cm").
	size: string;
	// Material label via a message function (e.g. Stoneware / Kamenina).
	material: () => string;
	// The unique physical pieces of this blueprint.
	instances: ProductInstance[];
};

export type Category = {
	slug: string;
	name: () => string;
	description: () => string;
	products: Product[];
};

const stoneware = () => m.material_stoneware();

// Build the instances for a product from a folder listing. `pieces` maps an
// instance folder name (under /products/<dir>/) to its ordered image files and
// availability. This mirrors the on-disk structure in static/products.
type PieceDef = { dir: string; files: string[]; available: boolean };

function makeInstances(productDir: string, pieces: PieceDef[]): ProductInstance[] {
	return pieces.map((piece, i) => ({
		id: `${productDir}-${piece.dir}`,
		label: `#${i + 1}`,
		images: piece.files.map((f) => `/products/${productDir}/${piece.dir}/${f}`),
		available: piece.available
	}));
}

export const categories: Category[] = [
	{
		slug: 'andele',
		name: () => m.category_angels_name(),
		description: () => m.category_angels_desc(),
		products: [
			{
				slug: 'andel',
				name: () => m.product_angel_name(),
				meta: () => m.product_meta_figure(),
				description: () => m.product_desc_angel(),
				care: () => m.product_care_default(),
				price: '390',
				size: '12 cm',
				material: stoneware,
				instances: makeInstances('angel', [
					{ dir: '01', files: ['01.jpg'], available: true },
					{ dir: '02', files: ['01.jpg'], available: true }
				])
			}
		]
	},
	{
		slug: 'zviratka',
		name: () => m.category_animals_name(),
		description: () => m.category_animals_desc(),
		products: [
			{
				slug: 'ptacek',
				name: () => m.product_bird_name(),
				meta: () => m.product_meta_figure(),
				description: () => m.product_desc_bird(),
				care: () => m.product_care_default(),
				price: '320',
				size: '9 cm',
				material: stoneware,
				instances: makeInstances('bird', [{ dir: '01', files: ['01.jpg'], available: true }])
			},
			{
				slug: 'kocicka',
				name: () => m.product_cat_name(),
				meta: () => m.product_meta_figure(),
				description: () => m.product_desc_cat(),
				care: () => m.product_care_default(),
				price: '340',
				size: '10 cm',
				material: stoneware,
				instances: makeInstances('cat', [
					{ dir: '01', files: ['01.jpg'], available: true },
					{ dir: '02', files: ['01.jpg'], available: true }
				])
			},
			{
				slug: 'rybka',
				name: () => m.product_fish_name(),
				meta: () => m.product_meta_figure(),
				description: () => m.product_desc_fish(),
				care: () => m.product_care_default(),
				price: '300',
				size: '11 cm',
				material: stoneware,
				instances: makeInstances('fish', [{ dir: '01', files: ['01.jpg'], available: true }])
			}
		]
	},
	{
		slug: 'postavicky',
		name: () => m.category_figures_name(),
		description: () => m.category_figures_desc(),
		products: [
			{
				slug: 'dubanek',
				name: () => m.product_dubanek_name(),
				meta: () => m.product_meta_figure(),
				description: () => m.product_desc_dubanek(),
				care: () => m.product_care_default(),
				price: '450',
				size: '14 cm',
				material: stoneware,
				instances: makeInstances('dubanek', [
					{ dir: '01', files: ['01.jpg'], available: true },
					{ dir: '02', files: ['01.jpg'], available: true },
					{ dir: '03', files: ['01.jpg'], available: false },
					{ dir: '04', files: ['01.jpg'], available: true },
					{ dir: '05', files: ['01.jpg'], available: true }
				])
			},
			{
				slug: 'panacek',
				name: () => m.product_guy_name(),
				meta: () => m.product_meta_figure(),
				description: () => m.product_desc_guy(),
				care: () => m.product_care_default(),
				price: '420',
				size: '13 cm',
				material: stoneware,
				instances: makeInstances('guy', [
					{ dir: '01', files: ['01.jpg'], available: true },
					{ dir: '02', files: ['01.jpg'], available: true }
				])
			}
		]
	},
	{
		slug: 'dekorace',
		name: () => m.category_decor_name(),
		description: () => m.category_decor_desc(),
		products: [
			{
				slug: 'listek',
				name: () => m.product_leaf_name(),
				meta: () => m.product_meta_decor(),
				description: () => m.product_desc_leaf(),
				care: () => m.product_care_default(),
				price: '260',
				size: '16 cm',
				material: stoneware,
				instances: makeInstances('leaf', [
					{ dir: '01', files: ['01.jpg'], available: true },
					{ dir: '02', files: ['01.jpg'], available: true },
					{ dir: '03', files: ['01.jpg'], available: true },
					{ dir: '04', files: ['01.jpg'], available: false }
				])
			}
		]
	}
];

export function getCategory(slug: string): Category | undefined {
	return categories.find((c) => c.slug === slug);
}

export function getProduct(slug: string): { product: Product; category: Category } | undefined {
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
export function getRelated(slug: string, limit = 4): Product[] {
	const found = getProduct(slug);
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
export function allProducts(): Product[] {
	return categories.flatMap((c) => c.products);
}
