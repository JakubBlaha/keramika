import { expect, test } from '@playwright/test';

// E2E tests for the cart page (src/routes/cart/+page.svelte) and the cart
// store (src/lib/cart.svelte.ts). Test titles carry the requirement ID for
// traceability. See docs/requirements/cart.md.
//
// The cart is client-side (localStorage), so each test starts from a clean
// slate and adds instances via the product detail page's "Add to cart" flow,
// exactly as a real buyer would.

test.describe('Cart', () => {
	test.beforeEach(async ({ page }) => {
		// Start every test with an empty cart regardless of storage left over
		// from a previous run/browser context.
		await page.goto('/produkty');
		await page.evaluate(() => localStorage.removeItem('keramika-cart'));
	});

	test('REQ-CART-003 - empty cart shows a message and a link back to products', async ({
		page
	}) => {
		await page.goto('/cart');
		await expect(page.getByText('Váš košík je prázdný.')).toBeVisible();
		const link = page.getByRole('link', { name: 'Prohlédnout produkty' });
		await expect(link).toBeVisible();
		await expect(link).toHaveAttribute('href', '/produkty');
	});

	test('REQ-CART-001, REQ-PRODUCT-007 - lists an added instance with image, title, size and price', async ({
		page
	}) => {
		await page.goto('/produkt/andel');
		await page.getByRole('button', { name: 'Přidat do košíku' }).click();

		await page.goto('/cart');
		const line = page.locator('li').filter({ hasText: 'Anděl' });
		await expect(line).toBeVisible();
		await expect(line.locator('img')).toBeVisible();
		await expect(line.getByText('12 cm')).toBeVisible();
		await expect(line.getByText('390 Kč')).toBeVisible();
		// Remove control is present.
		await expect(line.getByRole('button')).toBeVisible();
	});

	test('REQ-CART-002 - summary shows subtotal, shipping and total', async ({ page }) => {
		await page.goto('/produkt/andel');
		await page.getByRole('button', { name: 'Přidat do košíku' }).click();

		await page.goto('/cart');
		const summary = page.locator('aside');
		await expect(summary.getByText('Mezisoučet')).toBeVisible();
		await expect(summary.getByText('Doprava')).toBeVisible();
		await expect(summary.getByText('Osobní odběr')).toBeVisible();
		await expect(summary.getByText('Celkem')).toBeVisible();
		// One instance at 390 Kč -> subtotal and total both read 390 Kč.
		await expect(summary.getByText('390 Kč')).toHaveCount(2);
	});

	test('REQ-CART-004 - adding an already-added instance does not duplicate it', async ({
		page
	}) => {
		await page.goto('/produkt/andel');
		const add = page.getByRole('button', { name: 'Přidat do košíku' });
		await add.click();

		// The button immediately switches to a disabled "in cart" state.
		await expect(page.getByRole('button', { name: 'V košíku' })).toBeDisabled();
		await expect(add).toHaveCount(0);

		// Re-visiting with the same (default-selected) piece offers no add again.
		await page.goto('/produkt/andel');
		await expect(page.getByRole('button', { name: 'V košíku' })).toBeDisabled();
		await expect(page.getByText('Tento kus už máte v košíku.')).toBeVisible();

		await page.goto('/cart');
		await expect(page.locator('li')).toHaveCount(1);
	});

	test('REQ-CART-005 - removing the only line empties the cart', async ({ page }) => {
		await page.goto('/produkt/andel');
		await page.getByRole('button', { name: 'Přidat do košíku' }).click();

		await page.goto('/cart');
		const line = page.locator('li').filter({ hasText: 'Anděl' });
		await expect(line).toBeVisible();
		await line.getByRole('button').click();

		await expect(page.locator('li')).toHaveCount(0);
		await expect(page.getByText('Váš košík je prázdný.')).toBeVisible();
	});
});
