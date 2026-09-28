// Seed the local catalog through the project's own API (REQ-API-011).
//
// By default it seeds the Firebase emulators behind the dev server (or the e2e
// preview; see src/lib/firebaseEmulator.ts). The site has no built-in
// products; everything it shows comes from the database, and this is how a
// fresh database gets its catalog. Emulator data persists across
// `pnpm emulators` restarts, so this is needed once per fresh setup.
// `pnpm test` runs it automatically (tests/global-setup.ts).
//
// With --production it seeds the real project through the deployed site's API
// instead (a deliberate operation; --api must name the deployed site). The
// import upserts by slug/id: seeded categories, products and instances are
// overwritten with the seed data, anything else in the catalog is left alone.
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
// Locally it first provisions the local admin (LOCAL_ADMIN in
// scripts/lib/emulator.mjs) in the Auth emulator, the account to pick in the
// emulator's Google sign-in popup, then signs in as it to get the ID token the
// API verifies (REQ-API-002). In production it signs in as a temporary admin
// that is deleted afterwards (scripts/lib/production.mjs).
//
// Usage:
//   node scripts/seed.mjs [--api http://localhost:5173]      (with `pnpm emulators` + `pnpm dev`)
//   node scripts/seed.mjs --production --api https://<deployed site> [--api-key <web API key>]
//     The web API key defaults to PUBLIC_FIREBASE_API_KEY (environment or .env).

import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	LOCAL_ADMIN,
	assertEmulatorsRunning,
	ensureLocalAdmin,
	localAdminIdToken
} from './lib/emulator.mjs';
import { productionProjectId, temporaryAdminIdToken } from './lib/production.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'scripts', 'seed-data');

// --- args ------------------------------------------------------------------
const args = process.argv.slice(2);
function arg(name, fallback) {
	const i = args.indexOf(name);
	return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const production = args.includes('--production');
const API_BASE = arg('--api', production ? '' : 'http://localhost:5173').replace(/\/$/, '');
if (production && !/^https:\/\//.test(API_BASE)) {
	console.error('--production needs --api https://<deployed site>.');
	process.exit(1);
}

// A value from the environment, else from .env (only read for --production).
function envValue(name) {
	if (process.env[name]) return process.env[name];
	try {
		const line = readFileSync(join(root, '.env'), 'utf8')
			.split('\n')
			.find((l) => l.startsWith(`${name}=`));
		return line?.slice(name.length + 1).replace(/^["']|["']$/g, '') || undefined;
	} catch {
		return undefined;
	}
}

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

// Uploads the photos and imports the catalog as the admin behind `idToken`.
async function seed(idToken) {
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
}

// --- run --------------------------------------------------------------------
async function main() {
	if (production) {
		const apiKey = arg('--api-key', envValue('PUBLIC_FIREBASE_API_KEY'));
		if (!apiKey) {
			console.error('--production needs the web API key: --api-key or PUBLIC_FIREBASE_API_KEY.');
			process.exit(1);
		}
		console.log(`Seeding the PRODUCTION project ${productionProjectId()} via ${API_BASE}`);
		const admin = await temporaryAdminIdToken(apiKey);
		try {
			console.log(`Signed in as temporary admin ${admin.uid}`);
			await seed(admin.idToken);
		} finally {
			await admin.cleanup();
			console.log('Temporary admin deleted.');
		}
		return;
	}

	await assertEmulatorsRunning();
	console.log(`Seeding via API: ${API_BASE}`);
	await ensureLocalAdmin();
	await seed(await localAdminIdToken());
	console.log(`Sign in to /admin as ${LOCAL_ADMIN.email} in the emulator's Google popup.`);
}

main().catch((err) => {
	console.error(err instanceof Error && !err.code ? `Error: ${err.message}` : err);
	process.exit(1);
});
