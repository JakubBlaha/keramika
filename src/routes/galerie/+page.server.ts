import { allProducts } from '$lib/catalog';
import { loadCatalog } from '$lib/server/publicCatalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({ products: allProducts(await loadCatalog()) });
