// Authenticated fetch helpers for the admin catalog UI.
//
// Every mutating call to the write API (`/api/*`) must carry the admin's
// Firebase ID token as `Authorization: Bearer <idToken>` (see
// src/lib/server/apiAuth.ts). These helpers attach the token, parse JSON, and
// surface the API's structured error message so admin pages can show it.
//
// This module is browser-only in effect: it depends on the Firebase client
// (via getAdminIdToken), matching src/lib/adminAuth.ts.

import { getAdminIdToken } from '$lib/adminAuth';
import { downscaleImage } from '$lib/imageResize';
import type {
	CategoryRecord,
	InstanceRecord,
	ProductRecord,
	ProductWithInstances
} from '$lib/catalog-model';

// Error carrying the HTTP status and the API's structured details so the UI can
// distinguish validation problems (400) from conflicts (409) etc.
export class AdminApiError extends Error {
	status: number;
	details?: unknown;
	constructor(status: number, message: string, details?: unknown) {
		super(message);
		this.status = status;
		this.details = details;
	}
}

async function authHeaders(): Promise<Record<string, string>> {
	const token = await getAdminIdToken();
	if (!token) throw new AdminApiError(401, 'Not signed in');
	return { Authorization: `Bearer ${token}` };
}

async function parse<T>(res: Response): Promise<T> {
	let body: unknown = null;
	try {
		body = await res.json();
	} catch {
		// Non-JSON response; leave body null.
	}
	if (!res.ok) {
		const err = (body as { error?: { message?: string; details?: unknown } } | null)?.error;
		throw new AdminApiError(
			res.status,
			err?.message ?? `Request failed (${res.status})`,
			err?.details
		);
	}
	return body as T;
}

// ---- Categories ----------------------------------------------------------

export async function fetchCategories(): Promise<CategoryRecord[]> {
	const res = await fetch('/api/categories');
	return (await parse<{ categories: CategoryRecord[] }>(res)).categories;
}

export async function fetchCategory(slug: string): Promise<CategoryRecord> {
	const res = await fetch(`/api/categories/${slug}`);
	return (await parse<{ category: CategoryRecord }>(res)).category;
}

export async function createCategory(input: CategoryRecord): Promise<CategoryRecord> {
	const res = await fetch('/api/categories', {
		method: 'POST',
		headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
		body: JSON.stringify(input)
	});
	return (await parse<{ category: CategoryRecord }>(res)).category;
}

export async function updateCategory(slug: string, input: CategoryRecord): Promise<CategoryRecord> {
	const res = await fetch(`/api/categories/${slug}`, {
		method: 'PUT',
		headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
		body: JSON.stringify(input)
	});
	return (await parse<{ category: CategoryRecord }>(res)).category;
}

export async function deleteCategory(slug: string): Promise<void> {
	const res = await fetch(`/api/categories/${slug}`, {
		method: 'DELETE',
		headers: await authHeaders()
	});
	await parse<{ ok: true }>(res);
}

// ---- Products ------------------------------------------------------------

export async function fetchProducts(): Promise<ProductRecord[]> {
	const res = await fetch('/api/products');
	return (await parse<{ products: ProductRecord[] }>(res)).products;
}

export async function fetchProduct(slug: string): Promise<ProductWithInstances> {
	const res = await fetch(`/api/products/${slug}`);
	return (await parse<{ product: ProductWithInstances }>(res)).product;
}

export async function createProduct(input: ProductRecord): Promise<ProductRecord> {
	const res = await fetch('/api/products', {
		method: 'POST',
		headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
		body: JSON.stringify(input)
	});
	return (await parse<{ product: ProductRecord }>(res)).product;
}

export async function updateProduct(slug: string, input: ProductRecord): Promise<ProductRecord> {
	const res = await fetch(`/api/products/${slug}`, {
		method: 'PUT',
		headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
		body: JSON.stringify(input)
	});
	return (await parse<{ product: ProductRecord }>(res)).product;
}

export async function deleteProduct(slug: string): Promise<void> {
	const res = await fetch(`/api/products/${slug}`, {
		method: 'DELETE',
		headers: await authHeaders()
	});
	await parse<{ ok: true }>(res);
}

// ---- Instances -----------------------------------------------------------

export async function createInstance(
	productSlug: string,
	input: InstanceRecord
): Promise<InstanceRecord> {
	const res = await fetch(`/api/products/${productSlug}/instances`, {
		method: 'POST',
		headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
		body: JSON.stringify(input)
	});
	return (await parse<{ instance: InstanceRecord }>(res)).instance;
}

export async function updateInstance(
	productSlug: string,
	instanceId: string,
	input: InstanceRecord
): Promise<InstanceRecord> {
	const res = await fetch(`/api/products/${productSlug}/instances/${instanceId}`, {
		method: 'PUT',
		headers: { ...(await authHeaders()), 'Content-Type': 'application/json' },
		body: JSON.stringify(input)
	});
	return (await parse<{ instance: InstanceRecord }>(res)).instance;
}

export async function deleteInstance(productSlug: string, instanceId: string): Promise<void> {
	const res = await fetch(`/api/products/${productSlug}/instances/${instanceId}`, {
		method: 'DELETE',
		headers: await authHeaders()
	});
	await parse<{ ok: true }>(res);
}

// Uploads one or more image files for an instance and returns their ordered
// public URLs (REQ-ADMIN-019). The server stores them in Firebase Storage.
// Each photo is downscaled first and sent in its own request, so no request
// exceeds the hosting's body size limit (REQ-ADMIN-025).
export async function uploadInstanceImages(
	productSlug: string,
	instanceId: string,
	files: File[]
): Promise<string[]> {
	const urls: string[] = [];
	for (const file of files) {
		const form = new FormData();
		form.append('files', await downscaleImage(file));
		const res = await fetch(`/api/products/${productSlug}/instances/${instanceId}/images`, {
			method: 'POST',
			headers: await authHeaders(),
			body: form
		});
		urls.push(...(await parse<{ urls: string[] }>(res)).urls);
	}
	return urls;
}
