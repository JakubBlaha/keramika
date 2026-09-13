// Admin authentication and shared response helpers for the catalog write API.
//
// Every mutating endpoint requires a valid Firebase ID token carrying the
// `admin` custom claim (REQ-API-002, REQ-ADMIN-017). The token is passed as a
// Bearer token in the Authorization header. Anyone unauthenticated or without
// the claim is rejected with 401/403 and no change is made.
//
// Both the admin UI and the seed client authenticate the same way, so the seed
// exercises the same authorization path admins use (REQ-API-001).

import { json, type RequestEvent } from '@sveltejs/kit';
import { getAdmin } from '$lib/server/firebaseAdmin';
import type { ValidationError } from '$lib/catalog-model';

export type AdminIdentity = {
	uid: string;
	email?: string;
};

// Raised by requireAdmin() to short-circuit a handler with an HTTP status.
export class ApiError extends Error {
	status: number;
	details?: unknown;
	constructor(status: number, message: string, details?: unknown) {
		super(message);
		this.status = status;
		this.details = details;
	}
}

// Verifies the request carries a valid admin ID token. Returns the identity or
// throws ApiError(401/403). Callers should catch ApiError and use errorResponse.
export async function requireAdmin(event: RequestEvent): Promise<AdminIdentity> {
	const header = event.request.headers.get('authorization') ?? '';
	const match = /^Bearer\s+(.+)$/i.exec(header.trim());
	if (!match) {
		throw new ApiError(401, 'Missing or malformed Authorization: Bearer <idToken> header');
	}

	const idToken = match[1].trim();
	let decoded;
	try {
		decoded = await getAdmin().auth.verifyIdToken(idToken);
	} catch {
		throw new ApiError(401, 'Invalid or expired ID token');
	}

	if (decoded.admin !== true) {
		throw new ApiError(403, 'Caller is authenticated but is not an admin');
	}

	return { uid: decoded.uid, email: decoded.email };
}

// A structured JSON error body (REQ-API-008).
export function errorResponse(status: number, message: string, details?: unknown): Response {
	return json({ error: { message, details } }, { status });
}

// Turns a thrown error into an HTTP response, mapping ApiError to its status
// and anything else to a 500. This keeps handlers small and consistent.
export function toErrorResponse(err: unknown): Response {
	if (err instanceof ApiError) {
		return errorResponse(err.status, err.message, err.details);
	}
	const message = err instanceof Error ? err.message : 'Internal error';
	return errorResponse(500, message);
}

// Convenience: throw a 400 validation error carrying the field problems.
export function assertValid(errors: ValidationError[]): void {
	if (errors.length > 0) {
		throw new ApiError(400, 'Payload validation failed', errors);
	}
}
