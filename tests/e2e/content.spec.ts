import { expect, test } from '@playwright/test';

// E2E tests for content/SEO. Test titles carry the requirement ID for
// traceability. See docs/requirements/content.md.

test.describe('Content', () => {
	test('REQ-CONTENT-002 - each page sets its own title and meta description', async ({ page }) => {
		// Homepage.
		await page.goto('/');
		await expect(page).toHaveTitle('Lada Bartoníková · Keramika tvořená s láskou');
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

	test('REQ-CONTENT-003 - clicking anywhere on a contact card reveals it', async ({ page }) => {
		await page.goto('/kontakt');
		await page.waitForFunction(
			() => document.documentElement.dataset.firebaseEmulator !== undefined
		);

		// Click the card's corner, well away from the "show" button itself.
		for (const [heading, scheme] of [
			['E-mail', 'mailto:'],
			['Telefon', 'tel:']
		]) {
			const card = page.getByRole('heading', { name: heading, exact: true }).locator('..');
			await expect(card.locator(`a[href^="${scheme}"]`)).toHaveCount(0);
			await card.click({ position: { x: 8, y: 8 } });
			await expect(card.locator(`a[href^="${scheme}"]`)).toBeVisible();
		}
	});
});
