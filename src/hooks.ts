import type { Reroute } from '@sveltejs/kit';
import { deLocalizeUrl } from '$lib/paraglide/runtime';

// Map localized paths (e.g. /en/produkty) back to the underlying SvelteKit
// route (/produkty) so a single set of route files serves every locale.
export const reroute: Reroute = (request) => deLocalizeUrl(request.url).pathname;
