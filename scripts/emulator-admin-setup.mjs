// One-time setup for e2e admin tests: ensures the seed admin account exists in
// the Firebase Auth emulator and carries the `admin` custom claim, so
// tests/e2e/admin.spec.ts can sign in and exercise the admin CRUD pages.
//
// Only meant to run against the emulator suite (via `firebase emulators:exec`,
// see `pnpm test:e2e:emulator`), which sets FIREBASE_AUTH_EMULATOR_HOST /
// FIRESTORE_EMULATOR_HOST automatically. When those are set, the Admin SDK
// talks to the emulator and needs no real credentials.
//
// Usage: node scripts/emulator-admin-setup.mjs

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnv() {
	const env = {};
	const envPath = join(root, '.env');
	if (existsSync(envPath)) {
		const raw = readFileSync(envPath, 'utf8');
		for (const line of raw.split('\n')) {
			const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
			if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
		}
	}
	return { ...env, ...process.env };
}

const env = loadEnv();

if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
	console.error(
		'FIREBASE_AUTH_EMULATOR_HOST is not set - refusing to run outside the emulator suite.'
	);
	process.exit(1);
}

const projectId = env.PUBLIC_FIREBASE_PROJECT_ID || 'demo-keramika';
const email = env.SEED_ADMIN_EMAIL;
const password = env.SEED_ADMIN_PASSWORD;

if (!email || !password) {
	console.error('Missing SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env');
	process.exit(1);
}

async function main() {
	const app = getApps().length ? getApps()[0] : initializeApp({ projectId });
	const auth = getAuth(app);

	let user;
	try {
		user = await auth.getUserByEmail(email);
	} catch {
		user = await auth.createUser({ email, password, emailVerified: true });
	}

	await auth.setCustomUserClaims(user.uid, { admin: true });
	console.log(`Emulator admin ready: ${email} (uid ${user.uid})`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
