import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

// E2E tests for localization (Paraglide JS). Test titles carry the requirement
// ID for traceability. See docs/requirements/i18n.md.

const root = new URL('../../', import.meta.url);

function loadMessages(locale: string): Record<string, unknown> {
	const path = fileURLToPath(new URL(`messages/${locale}.json`, root));
	return JSON.parse(readFileSync(path, 'utf8'));
}

test.describe('i18n', () => {
	test('REQ-I18N-001 - Czech has no prefix, English is /en prefixed', async ({ page }) => {
		// Czech products page: no locale prefix.
		await page.goto('/produkty');
		expect(new URL(page.url()).pathname).toBe('/produkty');
		await expect(page.getByRole('heading', { name: 'Nabídka' })).toBeVisible();

		// English equivalent: /en prefix.
		await page.goto('/en/produkty');
		expect(new URL(page.url()).pathname).toBe('/en/produkty');
		await expect(page.getByRole('heading', { name: 'Our offer' })).toBeVisible();
	});

	test('REQ-I18N-002 - every base (cs) key exists in en', async () => {
		// Paraglide validates against the base locale (cs). Every cs key must have
		// an English translation so no user-facing copy falls back or breaks.
		const cs = loadMessages('cs');
		const en = loadMessages('en');
		const missingInEn = Object.keys(cs).filter((key) => !(key in en));
		expect(missingInEn, `keys present in cs.json but missing in en.json`).toEqual([]);
	});

	test('REQ-I18N-003 - internal links respect the active locale', async ({ page }) => {
		// On an English page, internal links must be /en-prefixed via localizeHref.
		await page.goto('/en');
		const cta = page.getByRole('link', { name: 'Browse products' });
		await expect(cta).toHaveAttribute('href', '/en/produkty');
	});

	test('REQ-I18N-004 - routes are reachable in both locales', async ({ page }) => {
		// Each route exists under both the root (cs) and /en (en).
		for (const path of ['/', '/produkty', '/produkty/andele', '/produkt/andel', '/galerie']) {
			const cs = await page.goto(path);
			expect(cs?.status(), `cs ${path}`).toBeLessThan(400);

			const enPath = path === '/' ? '/en' : `/en${path}`;
			const en = await page.goto(enPath);
			expect(en?.status(), `en ${enPath}`).toBeLessThan(400);
		}
	});
});
