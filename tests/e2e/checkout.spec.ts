import { expect, test, type Page } from '@playwright/test';

// E2E tests for the checkout / reservation page
// (src/routes/checkout/+page.svelte). Test titles carry the requirement ID for
// traceability. See docs/requirements/checkout.md.
//
// Checkout is client-side: the cart lives in localStorage and submitting a
// reservation writes an order to Firestore via src/lib/orders.ts. The tests
// that submit a valid reservation (REQ-CHECKOUT-006, REQ-CHECKOUT-010) write to
// the Firebase emulator suite that `pnpm test` starts.

const PRODUCT = '/produkt/andel';

async function addOneToCart(page: Page) {
	await page.goto(PRODUCT);
	await page.getByRole('button', { name: 'Přidat do košíku' }).click();
}

async function fillValidContact(page: Page) {
	await page.locator('#checkout-name').fill('Jan Novák');
	await page.locator('#checkout-email').fill('jan@example.com');
	await page.locator('#checkout-phone').fill('+420776384159');
	await page.getByRole('checkbox').check();
}

test.describe('Checkout', () => {
	test.beforeEach(async ({ page }) => {
		// Start from a clean cart every time.
		await page.goto('/produkty');
		await page.evaluate(() => localStorage.removeItem('keramika-cart'));
	});

	test('REQ-CHECKOUT-001 - shows an order summary with items and total', async ({ page }) => {
		await addOneToCart(page);
		await page.goto('/checkout');

		const summary = page.locator('aside');
		await expect(summary.getByText('Souhrn objednávky')).toBeVisible();
		await expect(summary.getByText('Anděl')).toBeVisible();
		// One item at 390 Kč: it appears as the line price and the total.
		await expect(summary.getByText('390 Kč')).toHaveCount(2);
		await expect(summary.getByText('Celkem')).toBeVisible();
	});

	test('REQ-CHECKOUT-002 - requires name, email and phone; no address field', async ({ page }) => {
		await addOneToCart(page);
		await page.goto('/checkout');

		await expect(page.locator('#checkout-name')).toBeVisible();
		await expect(page.locator('#checkout-email')).toBeVisible();
		await expect(page.locator('#checkout-phone')).toBeVisible();
		// All three are required.
		await expect(page.locator('#checkout-name')).toHaveAttribute('required', '');
		await expect(page.locator('#checkout-email')).toHaveAttribute('required', '');
		await expect(page.locator('#checkout-phone')).toHaveAttribute('required', '');
		// No shipping/billing address input is present.
		await expect(page.getByLabel(/adres/i)).toHaveCount(0);
	});

	test('REQ-CHECKOUT-005 - cannot submit without accepting the terms', async ({ page }) => {
		await addOneToCart(page);
		await page.goto('/checkout');

		await page.locator('#checkout-name').fill('Jan Novák');
		await page.locator('#checkout-email').fill('jan@example.com');
		await page.locator('#checkout-phone').fill('+420776384159');
		// Leave the terms checkbox unchecked and submit. The native `required`
		// attribute blocks submission, so no confirmation is ever shown.
		await page.getByRole('button', { name: 'Odeslat rezervaci' }).click();

		const terms = page.getByRole('checkbox');
		await expect(terms).not.toBeChecked();
		await expect(page.getByText('Děkujeme za rezervaci!')).toHaveCount(0);
		// The submit button and form are still on screen.
		await expect(page.getByRole('button', { name: 'Odeslat rezervaci' })).toBeVisible();
	});

	test('REQ-CHECKOUT-006 - shows a confirmation after a successful reservation', async ({
		page
	}) => {
		await addOneToCart(page);
		await page.goto('/checkout');
		await fillValidContact(page);
		await page.getByRole('button', { name: 'Odeslat rezervaci' }).click();

		await expect(page.getByRole('heading', { name: 'Děkujeme za rezervaci!' })).toBeVisible({
			timeout: 15000
		});
	});

	test('REQ-CHECKOUT-010 - placing the reservation clears the cart', async ({ page }) => {
		await addOneToCart(page);
		await page.goto('/checkout');
		await fillValidContact(page);
		await page.getByRole('button', { name: 'Odeslat rezervaci' }).click();

		await expect(page.getByRole('heading', { name: 'Děkujeme za rezervaci!' })).toBeVisible({
			timeout: 15000
		});
		// Cart emptied on success (REQ-CHECKOUT-010).
		const stored = await page.evaluate(() => localStorage.getItem('keramika-cart'));
		expect(stored === null || stored === '[]').toBeTruthy();
	});
});
