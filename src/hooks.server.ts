import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';

// Paraglide middleware determines the locale for each request (from the URL,
// cookie, or Accept-Language header), de-localizes the URL for the router, and
// sets the <html lang> / dir attributes on the rendered page.
export const handle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});
