// Bulk import (seed) endpoint (REQ-API-010, REQ-API-011).
//   POST /api/import
//     body: { categories: CategoryRecord[], products: ProductWithInstances[] }
//
// Idempotently upserts a whole catalog document by slug/id and reports how many
// entities were created versus updated. Used to seed or migrate the catalog
// through the same admin-authorized write path the UI uses. Admin only.

import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin, assertValid, toErrorResponse, ApiError } from '$lib/server/apiAuth';
import {
	validateCategory,
	validateProduct,
	validateInstance,
	type CatalogDocument,
	type ValidationError
} from '$lib/catalog-model';
import { bulkImport } from '$lib/server/catalogRepo';

export const prerender = false;

export const POST: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);

		const body = (await event.request.json()) as Partial<CatalogDocument>;
		if (!Array.isArray(body.categories) || !Array.isArray(body.products)) {
			throw new ApiError(400, 'Body must have `categories` and `products` arrays');
		}

		// Validate the whole document up front so nothing is written on any error
		// (REQ-API-008: no partial writes).
		const errors: ValidationError[] = [];
		body.categories.forEach((c, i) =>
			validateCategory(c).forEach((e) =>
				errors.push({ field: `categories[${i}].${e.field}`, message: e.message })
			)
		);
		body.products.forEach((p, i) => {
			validateProduct(p).forEach((e) =>
				errors.push({ field: `products[${i}].${e.field}`, message: e.message })
			);
			const instances = Array.isArray(p.instances) ? p.instances : [];
			instances.forEach((inst, j) =>
				validateInstance(inst).forEach((e) =>
					errors.push({
						field: `products[${i}].instances[${j}].${e.field}`,
						message: e.message
					})
				)
			);
		});
		assertValid(errors);

		const report = await bulkImport(body as CatalogDocument);
		return json({ report });
	} catch (err) {
		return toErrorResponse(err);
	}
};
