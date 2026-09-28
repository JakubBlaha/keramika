import { error } from '@sveltejs/kit';
import { getCategory } from '$lib/catalog';
import { loadCatalog } from '$lib/server/publicCatalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const categories = await loadCatalog();
	const category = getCategory(categories, params.category);
	if (!category) {
		error(404, 'Category not found');
	}
	// All categories feed the category switcher (REQ-LISTING-009).
	return { category, categories };
};
