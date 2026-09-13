// Grant (or revoke) the `admin` custom claim on a Firebase user by email.
//
// The admin area gates access on the `admin` custom claim carried by the
// signed-in user's ID token (REQ-ADMIN-017). Signing in with Google (or
// email/password) only proves identity; without this claim the user is
// authenticated but rejected by the layout gate and stays on the login page.
//
// Custom claims can only be set server-side with the Admin SDK. This script
// does that using the same keyless credential resolution as scripts/seed.mjs
// and src/lib/server/firebaseAdmin.ts: it prefers Application Default
// Credentials, otherwise falls back to the Firebase CLI refresh token from
// `firebase login`. No service-account key file is needed.
//
// Usage:
//   node scripts/grant-admin.mjs you@example.com
//   node scripts/grant-admin.mjs you@example.com --revoke
//
// After running, the user must sign out and sign in again (or wait for their
// ID token to refresh) so the new claim is picked up by the browser session.
//
// Requires: `firebase login` completed and PUBLIC_FIREBASE_PROJECT_ID in .env.

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initializeApp, applicationDefault, refreshToken, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Public Firebase CLI OAuth client (same one the API and seed use). Lets the
// script run with the developer's `firebase login` credentials, no key file.
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
const revoke = args.includes('--revoke');
const email = args.find((a) => !a.startsWith('--'));
if (!email) {
	console.error('Usage: node scripts/grant-admin.mjs <email> [--revoke]');
	process.exit(1);
}

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
if (!PROJECT_ID) {
	console.error('Missing PUBLIC_FIREBASE_PROJECT_ID in .env');
	process.exit(1);
}

// --- run --------------------------------------------------------------------
async function main() {
	const app = getApps().length
		? getApps()[0]
		: initializeApp({ credential: resolveCredential(), projectId: PROJECT_ID });
	const auth = getAuth(app);

	let user;
	try {
		user = await auth.getUserByEmail(email);
	} catch {
		console.error(
			`No user found for ${email}. Sign in once with that account first (so Firebase creates the user), then run this again.`
		);
		process.exit(1);
	}

	// Preserve any other existing claims; only flip `admin`.
	const claims = { ...(user.customClaims ?? {}) };
	if (revoke) {
		delete claims.admin;
	} else {
		claims.admin = true;
	}
	await auth.setCustomUserClaims(user.uid, claims);

	console.log(
		`${revoke ? 'Revoked' : 'Granted'} admin for ${email} (uid ${user.uid}). ` +
			'Sign out and sign in again to refresh the ID token.'
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
