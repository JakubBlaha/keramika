import { expect, test, type Page } from '@playwright/test';

// E2E tests for the product detail page (src/routes/produkt/[slug]/+page.svelte).
// Test titles carry the requirement ID for traceability.
// See docs/requirements/product-detail.md.
//
// Useful catalog facts:
//   dubanek - 5 instances, #3 is sold, 4 available
//   ptacek  - 1 instance, available (last piece)
//   andel   - 2 instances, both available

// Wait until SvelteKit has hydrated (the root layout sets this attribute in an
// $effect); before that, click handlers are not attached yet.
async function gotoHydrated(page: Page, path: string) {
	await page.goto(path);
	await page.waitForFunction(() => document.documentElement.dataset.firebaseEmulator !== undefined);
}

test.describe('Product detail', () => {
	test('REQ-PRODUCT-002, REQ-CATALOG-002 - instance picker selects the first available piece', async ({
		page
	}) => {
		await page.goto('/produkt/dubanek');
		// The picker is shown with a heading.
		await expect(page.getByText('Vyberte si kus')).toBeVisible();
		// The first available piece (#1) is selected by default.
		const first = page.getByRole('button', { name: 'Kus #1' });
		await expect(first).toHaveAttribute('aria-pressed', 'true');

		// Selecting another available piece updates the selection.
		const second = page.getByRole('button', { name: 'Kus #2' });
		await second.click();
		await expect(second).toHaveAttribute('aria-pressed', 'true');
		await expect(first).toHaveAttribute('aria-pressed', 'false');
	});

	test('REQ-PRODUCT-003 - sold instances are disabled', async ({ page }) => {
		await page.goto('/produkt/dubanek');
		// Instance #3 is sold: its picker button is disabled and shows "Prodáno".
		const soldButton = page.getByRole('button', { name: 'Kus #3' });
		await expect(soldButton).toBeDisabled();
		await expect(soldButton.getByText('Prodáno')).toBeVisible();
	});

	test('REQ-PRODUCT-004, REQ-CATALOG-004 - availability text reflects stock', async ({ page }) => {
		// More than one available -> available-of-total count.
		await page.goto('/produkt/dubanek');
		await expect(page.getByText('K dispozici 4 z 5 kusů')).toBeVisible();

		// Exactly one available -> last-piece message.
		await page.goto('/produkt/ptacek');
		await expect(page.getByText('Poslední kus skladem')).toBeVisible();
	});

	test('REQ-PRODUCT-006 - about/care/shipping accordion opens one at a time', async ({ page }) => {
		await gotoHydrated(page, '/produkt/andel');
		const about = page.getByRole('button', { name: 'O výrobku' });
		const care = page.getByRole('button', { name: 'Péče' });

		// About is open by default.
		await expect(about).toHaveAttribute('aria-expanded', 'true');
		await expect(care).toHaveAttribute('aria-expanded', 'false');

		// Opening Care collapses About.
		await care.click();
		await expect(care).toHaveAttribute('aria-expanded', 'true');
		await expect(about).toHaveAttribute('aria-expanded', 'false');
	});

	test('REQ-PRODUCT-009 - back link points to the category', async ({ page }) => {
		// Angel is in the "andele" category.
		await page.goto('/produkt/andel');
		const back = page.getByRole('link', { name: 'Zpět do kategorie' });
		await expect(back).toBeVisible();
		await expect(back).toHaveAttribute('href', '/produkty/andele');
	});
});
