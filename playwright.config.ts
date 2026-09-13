import { defineConfig, devices } from '@playwright/test';

// Base URL the tests run against. Override with PLAYWRIGHT_BASE_URL to point at
// an already-running server (e.g. the dev server the user runs separately).
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 4173);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

// When a base URL is provided we assume the server is already running and skip
// starting one ourselves. Otherwise we build once and serve the preview.
const useExternalServer = Boolean(process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
	testDir: './tests/e2e',
	// Fail the build on CI if test.only is left in the source.
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	// Deterministic run order; parallelism is fine for these read-only specs.
	fullyParallel: true,
	reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',

	use: {
		baseURL,
		trace: 'on-first-retry'
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],

	webServer: useExternalServer
		? undefined
		: {
				// Build then serve the production preview. We intentionally do NOT
				// use the dev server here (the user runs that separately). To test
				// against a running dev server, set PLAYWRIGHT_BASE_URL instead.
				command: `pnpm build && pnpm preview --port ${PORT}`,
				url: baseURL,
				reuseExistingServer: !process.env.CI,
				timeout: 120_000
			}
});
