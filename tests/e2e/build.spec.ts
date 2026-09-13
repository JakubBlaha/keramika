import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

// E2E / workflow tests for build and quality rules. Test titles carry the
// requirement ID for traceability. See docs/requirements/build.md.

const cwd = fileURLToPath(new URL('../../', import.meta.url));

function run(cmd: string) {
	return execSync(cmd, { cwd, stdio: 'pipe', encoding: 'utf8' });
}

test.describe('Build & quality', () => {
	// pnpm check runs svelte-kit sync + svelte-check; give it room.
	test('REQ-BUILD-001 - type/svelte checks and lint pass', async () => {
		test.setTimeout(180_000);

		// svelte-check (types + svelte) must complete without errors.
		expect(() => run('pnpm check')).not.toThrow();

		// eslint must pass across the repo.
		expect(() => run('pnpm exec eslint .')).not.toThrow();
	});

	test('REQ-BUILD-003 - UI is styled with Tailwind utilities', async ({ page }) => {
		// If Tailwind processed the templates, utility classes like max-w-site and
		// the earthy token utilities resolve to real CSS. We assert a Tailwind
		// utility actually produces a computed style on a served page.
		await page.goto('/produkty');

		// The layout container uses the max-w-site utility backed by --container-site.
		const maxWidth = await page.evaluate(() => {
			const el = document.querySelector('.max-w-site');
			return el ? getComputedStyle(el).maxWidth : '';
		});
		// 72rem === 1152px at the default 16px root font size.
		expect(maxWidth).toBe('1152px');
	});
});
