import { expect, test } from '@playwright/test';

// E2E tests for the catalog data model, verified through the rendered pages
// that surface that data. The catalog comes from the database, seeded from
// scripts/seed-data/ by the global setup. Test titles carry the requirement ID
// for traceability. See docs/requirements/catalog.md.

test.describe('Catalog', () => {
	test('REQ-CATALOG-006 - copy follows the locale, data fields do not', async ({ page }) => {
		await page.goto('/produkt/andel');
		await expect(page.getByRole('heading', { level: 1, name: 'Anděl' })).toBeVisible();
		await expect(page.getByText('12 cm')).toBeVisible();

		await page.goto('/en/produkt/andel');
		await expect(page.getByRole('heading', { level: 1, name: 'Angel' })).toBeVisible();
		await expect(page.getByText('12 cm')).toBeVisible();
	});

	test('REQ-CATALOG-008, REQ-PRODUCT-008 - related products come from the same category', async ({
		page
	}) => {
		// Acorn Folk is in "figures" with sibling "Little Guy" (panacek). The
		// related section must therefore link to that sibling.
		await page.goto('/produkt/dubanek');
		const related = page.getByRole('heading', { name: 'Mohlo by se vám líbit' });
		await expect(related).toBeVisible();
		// The related grid links to at least the same-category sibling.
		await expect(page.locator('a[href="/produkt/panacek"]')).toBeVisible();
	});
});
