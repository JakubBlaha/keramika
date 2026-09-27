import { expect, test, type Page } from '@playwright/test';

// E2E tests for the gallery page (src/routes/galerie/+page.svelte).
// Test titles carry the requirement ID for traceability.
// See docs/requirements/gallery.md.
//
// Useful catalog facts:
//   7 products, 17 instances in total
//   dubanek - 5 instances, #3 is sold
//   andel   - 2 instances, both available (first in gallery order)

// Wait until SvelteKit has hydrated (the root layout sets this attribute in an
// $effect); before that, clicks land on inert prerendered HTML.
async function gotoHydrated(page: Page, path: string) {
	await page.goto(path);
	await page.waitForFunction(() => document.documentElement.dataset.firebaseEmulator !== undefined);
}

test.describe('Gallery', () => {
	test('REQ-GALLERY-001 - every instance is shown, grouped by product', async ({ page }) => {
		await gotoHydrated(page, '/galerie');
		const main = page.locator('main');
		await expect(main.getByRole('heading', { level: 2 })).toHaveCount(7);

		const dubanek = main.getByRole('region', { name: 'Dubánek' });
		await expect(dubanek.getByRole('button')).toHaveCount(5);
		// Sold pieces are part of the gallery too.
		await expect(dubanek.getByRole('button', { name: /Dubánek #3/ })).toBeVisible();

		await expect(main.getByRole('listitem')).toHaveCount(17);
	});

	test('REQ-GALLERY-002 - grid shows no status or actions', async ({ page }) => {
		await gotoHydrated(page, '/galerie');
		await expect(page.getByText('Skladem')).toHaveCount(0);
		await expect(page.getByRole('link', { name: 'Koupit tento kus' })).toHaveCount(0);
		await expect(page.getByRole('link', { name: 'Zobrazit produkt' })).toHaveCount(0);
	});

	test('REQ-GALLERY-003 - fullscreen opens, steps and closes', async ({ page }) => {
		await gotoHydrated(page, '/galerie');
		await page.getByRole('button', { name: /Anděl #1/ }).click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();
		await expect(dialog.getByRole('img', { name: 'Anděl #1' })).toBeVisible();

		await page.keyboard.press('ArrowRight');
		await expect(dialog.getByRole('img', { name: 'Anděl #2' })).toBeVisible();
		await dialog.getByRole('button', { name: 'Předchozí kus' }).click();
		await expect(dialog.getByRole('img', { name: 'Anděl #1' })).toBeVisible();
		// Wraps from the first piece to the last one.
		await page.keyboard.press('ArrowLeft');
		await expect(dialog.getByText('17 / 17')).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(dialog).toBeHidden();

		await page.getByRole('button', { name: /Anděl #1/ }).click();
		await dialog.getByRole('button', { name: 'Zavřít' }).click();
		await expect(dialog).toBeHidden();
	});

	test('REQ-GALLERY-004 - fullscreen shows in-stock or sold status', async ({ page }) => {
		await gotoHydrated(page, '/galerie');
		const dialog = page.getByRole('dialog');
		const status = dialog.getByTestId('gallery-status');

		await page.getByRole('button', { name: /Dubánek #1/ }).click();
		await expect(status).toContainText('Skladem');
		await expect(status).toContainText('450 Kč');
		await page.keyboard.press('Escape');

		await page.getByRole('button', { name: /Dubánek #3/ }).click();
		await expect(status).toContainText('Prodáno');
		await expect(status).not.toContainText('Kč');
	});

	test('REQ-GALLERY-005 - buy link adds the piece and opens the cart', async ({ page }) => {
		await gotoHydrated(page, '/galerie');
		await page.getByRole('button', { name: /Dubánek #2/ }).click();
		const dialog = page.getByRole('dialog');
		await expect(dialog.getByRole('link', { name: 'Zobrazit produkt' })).toHaveCount(0);

		await dialog.getByRole('link', { name: 'Koupit tento kus' }).click();
		await expect(page).toHaveURL(/\/cart$/);
		const cart = await page.evaluate(() => localStorage.getItem('keramika-cart'));
		expect(JSON.parse(cart ?? '[]')).toEqual([
			{ instanceId: 'dubanek-02', productSlug: 'dubanek' }
		]);
	});

	test('REQ-GALLERY-006 - sold piece links to its product', async ({ page }) => {
		await gotoHydrated(page, '/galerie');
		await page.getByRole('button', { name: /Dubánek #3/ }).click();
		const dialog = page.getByRole('dialog');
		await expect(dialog.getByRole('link', { name: 'Koupit tento kus' })).toHaveCount(0);
		await expect(dialog.getByRole('link', { name: 'Zobrazit produkt' })).toHaveAttribute(
			'href',
			'/produkt/dubanek'
		);
	});

	test('REQ-GALLERY-007 - header links to the gallery in each locale', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('header').getByRole('link', { name: 'Galerie' })).toHaveAttribute(
			'href',
			'/galerie'
		);
		await page.goto('/en');
		await expect(page.locator('header').getByRole('link', { name: 'Gallery' })).toHaveAttribute(
			'href',
			'/en/galerie'
		);
	});
});
