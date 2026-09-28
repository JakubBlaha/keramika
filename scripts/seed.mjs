// Seed the local catalog through the project's own API (REQ-API-011).
//
// Local only: it seeds the Firebase emulators behind the dev server (or the
// e2e preview), never the production project (see src/lib/firebaseEmulator.ts).
// The site has no built-in products; everything it shows comes from the
// database, and this is how a fresh local database gets its catalog. Emulator
// data persists across `pnpm emulators` restarts, so this is needed once per
// fresh setup. `pnpm test` runs it automatically (tests/e2e/global-setup.ts).
//
// The catalog lives in scripts/seed-data/: catalog.json holds the categories,
// products and instances (with { cs, en } copy), and images/ the photos each
// instance references by relative path.
//
// This does NOT write to Firestore or Storage directly. It goes through the
// same API the admin UI uses (REQ-API-001): each instance's photos are
// uploaded to the image endpoint (REQ-API-007), and the catalog, with the
// returned URLs, is sent to the bulk import endpoint (POST /api/import,
// REQ-API-010). Both are idempotent, so re-running the seed is safe.
//
// It first provisions the local admin (LOCAL_ADMIN in scripts/lib/emulator.mjs)
// in the Auth emulator, the account to pick in the emulator's Google sign-in
// popup, then signs in as it to get the ID token the API verifies (REQ-API-002).
//
// Usage (with `pnpm emulators` and `pnpm dev` running):
//   node scripts/seed.mjs [--api http://localhost:5173]

import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	LOCAL_ADMIN,
	assertEmulatorsRunning,
	ensureLocalAdmin,
	localAdminIdToken
} from './lib/emulator.mjs';

const dataDir = join(dirname(fileURLToPath(import.meta.url)), 'seed-data');

// --- args ------------------------------------------------------------------
const args = process.argv.slice(2);
function arg(name, fallback) {
	const i = args.indexOf(name);
	return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const API_BASE = arg('--api', 'http://localhost:5173').replace(/\/$/, '');

// --- API calls ---------------------------------------------------------------
async function api(path, idToken, init) {
	const res = await fetch(`${API_BASE}${path}`, {
		...init,
		// Same-origin, like the admin UI: SvelteKit's CSRF check rejects form
		// posts (the image upload) without a matching Origin header.
		headers: { ...init.headers, authorization: `Bearer ${idToken}`, origin: API_BASE }
	});
	const text = await res.text();
	if (!res.ok) {
		throw new Error(`${init.method} ${path} failed: ${res.status} ${text}`);
	}
	return JSON.parse(text);
}

// Uploads one instance's photos and returns their public URLs, in order.
async function uploadImages(productSlug, instance, idToken) {
	const form = new FormData();
	for (const file of instance.images) {
		const data = readFileSync(join(dataDir, 'images', file));
		form.append('files', new Blob([data], { type: 'image/jpeg' }), basename(file));
	}
	const { urls } = await api(
		`/api/products/${productSlug}/instances/${instance.id}/images`,
		idToken,
		{ method: 'POST', body: form }
	);
	return urls;
}

// --- run --------------------------------------------------------------------
async function main() {
	await assertEmulatorsRunning();
	console.log(`Seeding via API: ${API_BASE}`);
	await ensureLocalAdmin();
	const idToken = await localAdminIdToken();

	const catalog = JSON.parse(readFileSync(join(dataDir, 'catalog.json'), 'utf8'));
	for (const product of catalog.products) {
		for (const instance of product.instances) {
			instance.images = await uploadImages(product.slug, instance, idToken);
		}
	}

	const report = await api('/api/import', idToken, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(catalog)
	});
	console.log('Import OK:', JSON.stringify(report));
	console.log(`Sign in to /admin as ${LOCAL_ADMIN.email} in the emulator's Google popup.`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
