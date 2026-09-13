// Single category endpoint (REQ-API-003, REQ-API-004).
//   GET    /api/categories/:slug -> read one category (public read)
//   PUT    /api/categories/:slug -> update a category (admin only)
//   DELETE /api/categories/:slug -> delete a category, blocked if it has
//                                   products (admin only, REQ-ADMIN-016)

import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin, assertValid, toErrorResponse, ApiError } from '$lib/server/apiAuth';
import { validateCategory, type CategoryRecord } from '$lib/catalog-model';
import { deleteCategory, getCategory, updateCategory } from '$lib/server/catalogRepo';

export const prerender = false;

export const GET: RequestHandler = async ({ params }) => {
	try {
		const category = await getCategory(params.slug!);
		if (!category) throw new ApiError(404, `Category not found: ${params.slug}`);
		return json({ category });
	} catch (err) {
		return toErrorResponse(err);
	}
};

export const PUT: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);
		const body = await event.request.json();
		assertValid(validateCategory(body));
		const updated = await updateCategory(event.params.slug!, body as CategoryRecord);
		return json({ category: updated });
	} catch (err) {
		return toErrorResponse(err);
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);
		await deleteCategory(event.params.slug!);
		return json({ ok: true });
	} catch (err) {
		return toErrorResponse(err);
	}
};
