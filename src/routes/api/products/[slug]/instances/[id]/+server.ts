// Single instance endpoint under a product (REQ-API-006).
//   PUT    /api/products/:slug/instances/:id -> update an instance (admin only)
//   DELETE /api/products/:slug/instances/:id -> delete an instance and update
//                                               the product counts (admin only)

import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin, assertValid, toErrorResponse } from '$lib/server/apiAuth';
import { validateInstance, type InstanceRecord } from '$lib/catalog-model';
import { deleteInstance, updateInstance } from '$lib/server/catalogRepo';

export const prerender = false;

export const PUT: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);
		const body = await event.request.json();
		assertValid(validateInstance(body));
		const updated = await updateInstance(
			event.params.slug!,
			event.params.id!,
			body as InstanceRecord
		);
		return json({ instance: updated });
	} catch (err) {
		return toErrorResponse(err);
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);
		await deleteInstance(event.params.slug!, event.params.id!);
		return json({ ok: true });
	} catch (err) {
		return toErrorResponse(err);
	}
};
