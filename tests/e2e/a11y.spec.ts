import { expect, test } from '@playwright/test';

// E2E tests for accessibility. Test titles carry the requirement ID for
// traceability. See docs/requirements/a11y.md.

test.describe('Accessibility', () => {
	test('REQ-A11Y-001 - meaningful images have non-empty alt text', async ({ page }) => {
		// Product listing: every product card image must carry descriptive alt text.
		await page.goto('/produkty/zviratka');
		const images = page.locator('main img');
		const count = await images.count();
		expect(count).toBeGreaterThan(0);

		for (let i = 0; i < count; i++) {
			const alt = await images.nth(i).getAttribute('alt');
			expect(alt, `image ${i} alt`).not.toBeNull();
			expect((alt ?? '').trim().length, `image ${i} alt not empty`).toBeGreaterThan(0);
		}
	});
});
