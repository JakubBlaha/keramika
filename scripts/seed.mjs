// Seed the initial catalog through the project's own API (REQ-API-011).
//
// This does NOT write to Firestore directly. It builds a CatalogDocument from
// the placeholder copy (messages/cs.json + messages/en.json) and the on-disk
// product/image structure, then POSTs it to the bulk import endpoint
// (POST /api/import, REQ-API-010) as an authenticated admin. That way the seed
// exercises the exact write + auth path the admin UI uses (REQ-API-001).
//
// Auth is keyless and needs no service-account key file. A dedicated
// email/password admin account is used:
//   1. The Admin SDK (using the Firebase CLI login credential) ensures the
//      account exists and carries the `admin` custom claim. These are REST
//      operations that do not require local JWT signing.
//   2. The seed signs in with that email/password via the Identity Toolkit
//      REST API using the public web API key, yielding a Firebase ID token
//      that the API verifies (REQ-API-002).
//
// The account email and password come from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
// in .env.
//
// Usage:
//   node scripts/seed.mjs [--api http://localhost:5173]
//
// Requires: `firebase login` completed, and PUBLIC_FIREBASE_* +
// SEED_ADMIN_EMAIL + SEED_ADMIN_PASSWORD set in .env.

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initializeApp, applicationDefault, refreshToken, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Public Firebase CLI OAuth client (same one the API uses). Lets the seed run
// with the developer's `firebase login` credentials, no service-account key.
const FIREBASE_CLI_CLIENT_ID =
	'563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const FIREBASE_CLI_CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';

function resolveCredential() {
	const hasAdc =
		!!process.env.GOOGLE_APPLICATION_CREDENTIALS ||
		existsSync(join(homedir(), '.config/gcloud/application_default_credentials.json'));
	if (hasAdc) return applicationDefault();

	const cliPath = join(homedir(), '.config/configstore/firebase-tools.json');
	if (existsSync(cliPath)) {
		const cli = JSON.parse(readFileSync(cliPath, 'utf8'));
		const rt = cli?.tokens?.refresh_token;
		if (rt) {
			return refreshToken({
				type: 'authorized_user',
				client_id: FIREBASE_CLI_CLIENT_ID,
				client_secret: FIREBASE_CLI_CLIENT_SECRET,
				refresh_token: rt
			});
		}
	}
	return applicationDefault();
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// --- args ------------------------------------------------------------------
const args = process.argv.slice(2);
function arg(name, fallback) {
	const i = args.indexOf(name);
	return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const API_BASE = arg('--api', 'http://localhost:5173').replace(/\/$/, '');

// --- env (.env) ------------------------------------------------------------
function loadEnv() {
	const env = {};
	try {
		const raw = readFileSync(join(root, '.env'), 'utf8');
		for (const line of raw.split('\n')) {
			const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
			if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
		}
	} catch {
		// no .env; fall back to process.env
	}
	return { ...env, ...process.env };
}
const env = loadEnv();
const PROJECT_ID = env.PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = env.PUBLIC_FIREBASE_API_KEY;
const STORAGE_BUCKET = env.PUBLIC_FIREBASE_STORAGE_BUCKET;
const ADMIN_EMAIL = env.SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = env.SEED_ADMIN_PASSWORD;
if (!PROJECT_ID || !API_KEY) {
	console.error('Missing PUBLIC_FIREBASE_PROJECT_ID / PUBLIC_FIREBASE_API_KEY in .env');
	process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
	console.error('Missing SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env');
	process.exit(1);
}

// --- messages --------------------------------------------------------------
const cs = JSON.parse(readFileSync(join(root, 'messages/cs.json'), 'utf8'));
const en = JSON.parse(readFileSync(join(root, 'messages/en.json'), 'utf8'));
// Build a { cs, en } localized map from a message key.
const L = (key) => ({ cs: cs[key], en: en[key] });

// Public Storage URL for an image path under static/products.
const imageUrl = (productDir, pieceDir, file) =>
	`https://storage.googleapis.com/${STORAGE_BUCKET}/products/${productDir}/${pieceDir}/${file}`;

function makeInstances(productDir, pieces) {
	return pieces.map((piece, i) => ({
		id: `${productDir}-${piece.dir}`,
		label: `#${i + 1}`,
		images: piece.files.map((f) => imageUrl(productDir, piece.dir, f)),
		available: piece.available
	}));
}

// --- catalog document (mirrors src/lib/catalog.ts) -------------------------
const meta_figure = L('product_meta_figure');
const meta_decor = L('product_meta_decor');
const care = L('product_care_default');
const material = L('material_stoneware');

const categories = [
	{ slug: 'andele', name: L('category_angels_name'), description: L('category_angels_desc') },
	{ slug: 'zviratka', name: L('category_animals_name'), description: L('category_animals_desc') },
	{ slug: 'postavicky', name: L('category_figures_name'), description: L('category_figures_desc') },
	{ slug: 'dekorace', name: L('category_decor_name'), description: L('category_decor_desc') }
];

const products = [
	{
		slug: 'andel',
		categorySlug: 'andele',
		name: L('product_angel_name'),
		meta: meta_figure,
		description: L('product_desc_angel'),
		care,
		price: '390',
		size: '12 cm',
		material,
		instances: makeInstances('angel', [
			{ dir: '01', files: ['01.jpg'], available: true },
			{ dir: '02', files: ['01.jpg'], available: true }
		])
	},
	{
		slug: 'ptacek',
		categorySlug: 'zviratka',
		name: L('product_bird_name'),
		meta: meta_figure,
		description: L('product_desc_bird'),
		care,
		price: '320',
		size: '9 cm',
		material,
		instances: makeInstances('bird', [{ dir: '01', files: ['01.jpg'], available: true }])
	},
	{
		slug: 'kocicka',
		categorySlug: 'zviratka',
		name: L('product_cat_name'),
		meta: meta_figure,
		description: L('product_desc_cat'),
		care,
		price: '340',
		size: '10 cm',
		material,
		instances: makeInstances('cat', [
			{ dir: '01', files: ['01.jpg'], available: true },
			{ dir: '02', files: ['01.jpg'], available: true }
		])
	},
	{
		slug: 'rybka',
		categorySlug: 'zviratka',
		name: L('product_fish_name'),
		meta: meta_figure,
		description: L('product_desc_fish'),
		care,
		price: '300',
		size: '11 cm',
		material,
		instances: makeInstances('fish', [{ dir: '01', files: ['01.jpg'], available: true }])
	},
	{
		slug: 'dubanek',
		categorySlug: 'postavicky',
		name: L('product_dubanek_name'),
		meta: meta_figure,
		description: L('product_desc_dubanek'),
		care,
		price: '450',
		size: '14 cm',
		material,
		instances: makeInstances('dubanek', [
			{ dir: '01', files: ['01.jpg'], available: true },
			{ dir: '02', files: ['01.jpg'], available: true },
			{ dir: '03', files: ['01.jpg'], available: false },
			{ dir: '04', files: ['01.jpg'], available: true },
			{ dir: '05', files: ['01.jpg'], available: true }
		])
	},
	{
		slug: 'panacek',
		categorySlug: 'postavicky',
		name: L('product_guy_name'),
		meta: meta_figure,
		description: L('product_desc_guy'),
		care,
		price: '420',
		size: '13 cm',
		material,
		instances: makeInstances('guy', [
			{ dir: '01', files: ['01.jpg'], available: true },
			{ dir: '02', files: ['01.jpg'], available: true }
		])
	},
	{
		slug: 'listek',
		categorySlug: 'dekorace',
		name: L('product_leaf_name'),
		meta: meta_decor,
		description: L('product_desc_leaf'),
		care,
		price: '260',
		size: '16 cm',
		material,
		instances: makeInstances('leaf', [
			{ dir: '01', files: ['01.jpg'], available: true },
			{ dir: '02', files: ['01.jpg'], available: true },
			{ dir: '03', files: ['01.jpg'], available: true },
			{ dir: '04', files: ['01.jpg'], available: false }
		])
	}
];

const catalogDocument = { categories, products };

// --- admin ID token (keyless) ----------------------------------------------
async function getAdminIdToken() {
	const app = getApps().length
		? getApps()[0]
		: initializeApp({ credential: resolveCredential(), projectId: PROJECT_ID });

	const auth = getAuth(app);

	// Ensure the seed admin account exists with the given password and carries
	// the admin claim. These are Admin REST operations (no local JWT signing).
	let user;
	try {
		user = await auth.getUserByEmail(ADMIN_EMAIL);
		await auth.updateUser(user.uid, { password: ADMIN_PASSWORD, emailVerified: true });
	} catch {
		user = await auth.createUser({
			email: ADMIN_EMAIL,
			password: ADMIN_PASSWORD,
			emailVerified: true
		});
	}
	await auth.setCustomUserClaims(user.uid, { admin: true });

	// Sign in with email/password via Identity Toolkit to get an ID token. The
	// admin claim is embedded because it was set before this sign-in.
	const res = await fetch(
		`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
		{
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				email: ADMIN_EMAIL,
				password: ADMIN_PASSWORD,
				returnSecureToken: true
			})
		}
	);
	if (!res.ok) {
		throw new Error(`signInWithPassword failed: ${res.status} ${await res.text()}`);
	}
	const { idToken } = await res.json();
	return idToken;
}

// --- run --------------------------------------------------------------------
async function main() {
	console.log(`Seeding via API: ${API_BASE}/api/import`);
	const idToken = await getAdminIdToken();

	const res = await fetch(`${API_BASE}/api/import`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			authorization: `Bearer ${idToken}`
		},
		body: JSON.stringify(catalogDocument)
	});

	const text = await res.text();
	if (!res.ok) {
		console.error(`Import failed: ${res.status}`);
		console.error(text);
		process.exit(1);
	}
	console.log('Import OK:', text);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
