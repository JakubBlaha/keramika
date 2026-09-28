import { allProducts, coverImage } from '$lib/catalog';
import { loadCatalog } from '$lib/server/publicCatalog';
import type { PageServerLoad } from './$types';

// Featured products are the first catalog products, enough for at least two
// rows of the 4-column grid (REQ-HOME-003); the hero collage shows the first
// three of them that have a photo.
export const load: PageServerLoad = async () => {
	const featured = allProducts(await loadCatalog()).slice(0, 8);
	return {
		featured,
		heroPieces: featured
			.filter((p) => coverImage(p))
			.slice(0, 3)
			.map((p) => ({ src: coverImage(p), alt: p.name }))
	};
};
