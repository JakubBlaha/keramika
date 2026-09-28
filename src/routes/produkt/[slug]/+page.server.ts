import { error } from '@sveltejs/kit';
import { getProduct, getRelated } from '$lib/catalog';
import { loadCatalog } from '$lib/server/publicCatalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const categories = await loadCatalog();
	const found = getProduct(categories, params.slug);
	if (!found) {
		error(404, 'Product not found');
	}
	return {
		product: found.product,
		category: { slug: found.category.slug, name: found.category.name },
		related: getRelated(categories, params.slug)
	};
};
