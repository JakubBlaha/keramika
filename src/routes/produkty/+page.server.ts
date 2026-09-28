import { loadCatalog } from '$lib/server/publicCatalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({ categories: await loadCatalog() });
