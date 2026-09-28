// Grant (or revoke) the `admin` custom claim on a Firebase user by email.
//
// The admin area gates access on the `admin` custom claim carried by the
// signed-in user's ID token (REQ-ADMIN-017). Signing in with Google only
// proves identity; without this claim the user is
// authenticated but rejected by the layout gate and stays on the login page.
//
// Custom claims can only be set server-side with the Admin SDK. By default this
// targets the local Auth emulator (like everything local; see
// src/lib/firebaseEmulator.ts). Granting a real admin is a deliberate
// production operation: pass --production, which uses your `firebase login`
// and the project from .firebaserc (scripts/lib/production.mjs).
//
// Usage:
//   node scripts/grant-admin.mjs you@example.com [--revoke]               (emulator)
//   node scripts/grant-admin.mjs you@example.com [--revoke] --production  (real project)
//
// After running, the user must sign out and sign in again (or wait for their
// ID token to refresh) so the new claim is picked up by the browser session.

import { getAuth } from 'firebase-admin/auth';
import { assertEmulatorsRunning, emulatorAdminApp } from './lib/emulator.mjs';
import { productionAdminApp, productionProjectId } from './lib/production.mjs';

// --- args ------------------------------------------------------------------
const args = process.argv.slice(2);
const revoke = args.includes('--revoke');
const production = args.includes('--production');
const email = args.find((a) => !a.startsWith('--'));
if (!email) {
	console.error('Usage: node scripts/grant-admin.mjs <email> [--revoke] [--production]');
	process.exit(1);
}

// --- run --------------------------------------------------------------------
async function main() {
	let app;
	if (production) {
		console.log(`Targeting the PRODUCTION project ${productionProjectId()}.`);
		app = productionAdminApp();
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
