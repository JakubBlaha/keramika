// Grant (or revoke) the `admin` custom claim on a Firebase user by email.
//
// The admin area gates access on the `admin` custom claim carried by the
// signed-in user's ID token (REQ-ADMIN-017). Signing in with Google only
// proves identity; without this claim the user is
// authenticated but rejected by the layout gate and stays on the login page.
//
// Custom claims can only be set server-side with the Admin SDK. By default this
// targets the local Auth emulator (like everything local; see
// src/lib/firebaseEmulator.ts). Granting a real admin is the one deliberate
// production operation: pass --production, which uses Application Default
// Credentials or else the Firebase CLI refresh token from `firebase login`, and
// the project from .firebaserc.
//
// Usage:
//   node scripts/grant-admin.mjs you@example.com [--revoke]               (emulator)
//   node scripts/grant-admin.mjs you@example.com [--revoke] --production  (real project)
//
// After running, the user must sign out and sign in again (or wait for their
// ID token to refresh) so the new claim is picked up by the browser session.

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initializeApp, applicationDefault, refreshToken } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { assertEmulatorsRunning, emulatorAdminApp } from './lib/emulator.mjs';

// Public Firebase CLI OAuth client. Lets the script run with the developer's
// `firebase login` credentials, no key file.
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

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// --- args ------------------------------------------------------------------
const args = process.argv.slice(2);
const revoke = args.includes('--revoke');
const production = args.includes('--production');
const email = args.find((a) => !a.startsWith('--'));
if (!email) {
	console.error('Usage: node scripts/grant-admin.mjs <email> [--revoke] [--production]');
	process.exit(1);
}

async function productionApp() {
	const rc = JSON.parse(readFileSync(join(root, '.firebaserc'), 'utf8'));
	const projectId = rc.projects?.default;
	if (!projectId) {
		console.error('No default project in .firebaserc');
		process.exit(1);
	}
	console.log(`Targeting the PRODUCTION project ${projectId}.`);
	// Clear any emulator hosts so the Admin SDK cannot silently hit an emulator.
	delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
	return initializeApp({ credential: resolveCredential(), projectId });
}

// --- run --------------------------------------------------------------------
async function main() {
	let app;
	if (production) {
		app = await productionApp();
	} else {
		await assertEmulatorsRunning();
		app = emulatorAdminApp();
	}
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
