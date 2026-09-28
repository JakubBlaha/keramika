// Starts the local Firebase emulator suite for development (`pnpm emulators`).
// Run it next to `pnpm dev`; every local build talks to it instead of the
// production project (see src/lib/firebaseEmulator.ts).
//
// Data is kept in .emulator-data/ across restarts: imported on start when a
// previous export exists, exported on exit (Ctrl-C).

import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { EMULATOR_PROJECT_ID } from './lib/emulator.mjs';

const DATA_DIR = '.emulator-data';

const args = [
	'emulators:start',
	'--project',
	EMULATOR_PROJECT_ID,
	'--only',
	'auth,firestore,storage',
	'--export-on-exit',
	DATA_DIR
];
if (existsSync(`${DATA_DIR}/firebase-export-metadata.json`)) args.push('--import', DATA_DIR);

const child = spawn('firebase', args, { stdio: 'inherit' });
// Ctrl-C reaches the emulators directly; wait for them to export and exit.
process.on('SIGINT', () => {});
child.on('exit', (code) => process.exit(code ?? 0));
