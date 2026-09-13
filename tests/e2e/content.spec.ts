import { expect, test } from '@playwright/test';

// E2E tests for content/SEO. Test titles carry the requirement ID for
// traceability. See docs/requirements/content.md.

test.describe('Content', () => {
	test('REQ-CONTENT-002 - each page sets its own title and meta description', async ({ page }) => {
		// Homepage.
		await page.goto('/');
		await expect(page).toHaveTitle('Lada Bartoníková · Ruční keramika');
		await expect(page.locator('head meta[name="description"]')).toHaveAttribute(
			'content',
			/Ruční keramika/
		);

		// Products landing has its own distinct title.
		await page.goto('/produkty');
		await expect(page).toHaveTitle('Produkty · Lada Bartoníková');

		// Product detail sets a product-specific title and description.
		await page.goto('/produkt/andel');
		await expect(page).toHaveTitle('Anděl · Lada Bartoníková');
		await expect(page.locator('head meta[name="description"]')).toHaveAttribute(
			'content',
			/anděl/i
		);
	});
});
