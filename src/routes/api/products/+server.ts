// Products collection endpoint (REQ-API-003, REQ-API-005).
//   GET  /api/products -> list all products (public read)
//   POST /api/products -> create a product (admin only)

import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin, assertValid, toErrorResponse } from '$lib/server/apiAuth';
import { validateProduct, type ProductRecord } from '$lib/catalog-model';
import { createProduct, listProducts } from '$lib/server/catalogRepo';

export const prerender = false;

export const GET: RequestHandler = async () => {
	try {
		return json({ products: await listProducts() });
	} catch (err) {
		return toErrorResponse(err);
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);
		const body = await event.request.json();
		assertValid(validateProduct(body));
		const created = await createProduct(body as ProductRecord);
		return json({ product: created }, { status: 201 });
	} catch (err) {
		return toErrorResponse(err);
	}
};
