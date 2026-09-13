// Single product endpoint (REQ-API-003, REQ-API-005).
//   GET    /api/products/:slug -> read one product with its instances (public)
//   PUT    /api/products/:slug -> update a product (admin only)
//   DELETE /api/products/:slug -> delete a product and cascade its instances
//                                 (admin only, REQ-API-005)

import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin, assertValid, toErrorResponse, ApiError } from '$lib/server/apiAuth';
import { validateProduct, type ProductRecord } from '$lib/catalog-model';
import { deleteProduct, getProduct, updateProduct } from '$lib/server/catalogRepo';

export const prerender = false;

export const GET: RequestHandler = async ({ params }) => {
	try {
		const product = await getProduct(params.slug!);
		if (!product) throw new ApiError(404, `Product not found: ${params.slug}`);
		return json({ product });
	} catch (err) {
		return toErrorResponse(err);
	}
};

export const PUT: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);
		const body = await event.request.json();
		assertValid(validateProduct(body));
		const updated = await updateProduct(event.params.slug!, body as ProductRecord);
		return json({ product: updated });
	} catch (err) {
		return toErrorResponse(err);
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);
		await deleteProduct(event.params.slug!);
		return json({ ok: true });
	} catch (err) {
		return toErrorResponse(err);
	}
};
