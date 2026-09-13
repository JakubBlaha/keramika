import { error } from '@sveltejs/kit';
import { allProducts, getProduct } from '$lib/catalog';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

// Prerender one page per known product slug (both locales are handled by the
// top-level prerender config that seeds "/" and "/en").
export const entries: EntryGenerator = () => {
	return allProducts().map((p) => ({ slug: p.slug }));
};

export const load: PageLoad = ({ params }) => {
	const found = getProduct(params.slug);

	if (!found) {
		error(404, 'Product not found');
	}

	// Return only the language-neutral slug and its category slug. The component
	// resolves the product (and its translatable message functions) from the
	// catalog, since functions cannot be serialized across the load boundary.
	return {
		slug: found.product.slug,
		categorySlug: found.category.slug
	};
};
