// Runs a command against a fresh, throwaway Firebase emulator suite (used by
// `pnpm test`, whose Playwright global setup then seeds it). Extra arguments
// are passed through, e.g. `pnpm test tests/e2e/admin.spec.ts`.
//
// Usage: node scripts/with-emulators.mjs <command> [args...]

import { spawn } from 'node:child_process';
import { EMULATOR_HOST, EMULATOR_PORTS, EMULATOR_PROJECT_ID } from './lib/emulator.mjs';

const command = process.argv.slice(2);
if (!command.length) {
	console.error('Usage: node scripts/with-emulators.mjs <command> [args...]');
	process.exit(1);
}

// The suite uses fixed ports, so it cannot start while `pnpm emulators` runs.
try {
	await fetch(`http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}/`);
	console.error(
		'The Firebase emulators are already running (`pnpm emulators`?). Stop them first: ' +
			'tests run on a fresh, throwaway emulator suite.'
	);
	process.exit(1);
} catch {
	// Not running: good.
}

const quote = (arg) => `'${arg.replaceAll("'", `'\\''`)}'`;
const script = command.map(quote).join(' ');

const child = spawn(
	'firebase',
	['emulators:exec', '--project', EMULATOR_PROJECT_ID, '--only', 'auth,firestore,storage', script],
	{ stdio: 'inherit' }
);
process.on('SIGINT', () => {});
child.on('exit', (code) => process.exit(code ?? 1));
