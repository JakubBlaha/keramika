import { allProducts } from '$lib/catalog';
import { loadCatalog } from '$lib/server/publicCatalog';
import type { PageServerLoad } from './$types';

// The cart itself lives in localStorage and only holds instance ids; the page
// resolves them against the current catalog.
export const load: PageServerLoad = async () => ({ products: allProducts(await loadCatalog()) });
