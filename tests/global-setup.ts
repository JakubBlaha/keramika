import { execFileSync } from 'node:child_process';
import type { FullConfig } from '@playwright/test';

// The site has no built-in products, so the fresh emulator suite that
// `pnpm test` starts is seeded with the catalog (and the local admin) through
// the app's own API before any test runs. Playwright starts the webServer
// before global setup, so the API is up. See scripts/seed.mjs.
export default function globalSetup(config: FullConfig) {
	const baseURL = config.projects[0].use.baseURL!;
	execFileSync('node', ['scripts/seed.mjs', '--api', baseURL], { stdio: 'inherit' });
}
