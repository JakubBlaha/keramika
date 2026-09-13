import { error } from '@sveltejs/kit';
import { categories, getCategory } from '$lib/catalog';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

// Prerender one page per known category slug (both locales are handled by the
// top-level prerender config that seeds "/" and "/en").
export const entries: EntryGenerator = () => {
	return categories.map((c) => ({ category: c.slug }));
};

export const load: PageLoad = ({ params }) => {
	const category = getCategory(params.category);

	if (!category) {
		error(404, 'Category not found');
	}

	// Only return the language-neutral slug. The component resolves the
	// category (and its translatable message functions) from the catalog,
	// since functions cannot be serialized across the load boundary.
	return {
		slug: category.slug
	};
};
