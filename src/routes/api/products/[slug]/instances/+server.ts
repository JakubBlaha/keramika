// Instances collection endpoint under a product (REQ-API-003, REQ-API-006).
//   GET  /api/products/:slug/instances -> list a product's instances (public)
//   POST /api/products/:slug/instances -> create an instance (admin only)

import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin, assertValid, toErrorResponse } from '$lib/server/apiAuth';
import { validateInstance, type InstanceRecord } from '$lib/catalog-model';
import { createInstance, listInstances } from '$lib/server/catalogRepo';

export const prerender = false;

export const GET: RequestHandler = async ({ params }) => {
	try {
		return json({ instances: await listInstances(params.slug!) });
	} catch (err) {
		return toErrorResponse(err);
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);
		const body = await event.request.json();
		assertValid(validateInstance(body));
		const created = await createInstance(event.params.slug!, body as InstanceRecord);
		return json({ instance: created }, { status: 201 });
	} catch (err) {
		return toErrorResponse(err);
	}
};
