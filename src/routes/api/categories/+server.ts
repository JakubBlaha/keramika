// Categories collection endpoint (REQ-API-003, REQ-API-004).
//   GET  /api/categories        -> list all categories (public read)
//   POST /api/categories        -> create a category (admin only)

import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin, assertValid, toErrorResponse } from '$lib/server/apiAuth';
import { validateCategory, type CategoryRecord } from '$lib/catalog-model';
import { createCategory, listCategories } from '$lib/server/catalogRepo';

// This route is dynamic; it must not be prerendered with the static site.
export const prerender = false;

export const GET: RequestHandler = async () => {
	try {
		return json({ categories: await listCategories() });
	} catch (err) {
		return toErrorResponse(err);
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);
		const body = await event.request.json();
		assertValid(validateCategory(body));
		const created = await createCategory(body as CategoryRecord);
		return json({ category: created }, { status: 201 });
	} catch (err) {
		return toErrorResponse(err);
	}
};
