// Instance image upload endpoint (REQ-API-007, REQ-ADMIN-019).
//   POST /api/products/:slug/instances/:id/images
//     multipart/form-data with one or more `files` fields.
//
// Files are stored in Firebase Storage under the product/instance path and
// their ordered public URLs are returned so the caller can record them on the
// instance. Admin only.

import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin, toErrorResponse, ApiError } from '$lib/server/apiAuth';
import { uploadInstanceImages, type UploadFile } from '$lib/server/catalogRepo';

export const prerender = false;

export const POST: RequestHandler = async (event) => {
	try {
		await requireAdmin(event);

		const form = await event.request.formData();
		const entries = form.getAll('files').filter((f): f is File => f instanceof File);
		if (entries.length === 0) {
			throw new ApiError(400, 'No files provided; send one or more `files` fields');
		}

		const files: UploadFile[] = [];
		for (const file of entries) {
			files.push({
				filename: file.name,
				contentType: file.type || 'application/octet-stream',
				data: Buffer.from(await file.arrayBuffer())
			});
		}

		const urls = await uploadInstanceImages(event.params.slug!, event.params.id!, files);
		return json({ urls }, { status: 201 });
	} catch (err) {
		return toErrorResponse(err);
	}
};
