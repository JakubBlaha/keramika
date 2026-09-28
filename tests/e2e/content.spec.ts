import { expect, test } from '@playwright/test';

// E2E tests for content pages. Test titles carry the requirement ID for
// traceability. See docs/requirements/content.md.

test.describe('Content', () => {
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
