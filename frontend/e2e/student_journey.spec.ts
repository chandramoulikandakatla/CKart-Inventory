import { test, expect } from '@playwright/test';

test.describe('Student Full Commerce Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to base URL and initialize clean session
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('campuskart_student_screen', 'welcome');
      localStorage.setItem('campuskart_student_authed', 'false');
    });
    await page.reload();
  });

  test('Full student journey: Welcome -> Credentials -> PIN -> Add to Cart -> 5s Payment -> Live Receipt', async ({ page }) => {
    // 1. Welcome Screen
    await expect(page.getByRole('heading', { name: /Welcome to CampusKart/i })).toBeVisible({ timeout: 15000 });
    const continueBtn = page.getByRole('button', { name: /Continue to Login/i });
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();

    // 2. Credentials Screen
    await expect(page.getByRole('heading', { name: /Student Credentials/i })).toBeVisible();
    const studentIdInput = page.locator('input[placeholder="e.g. CK-2026-101"]');
    const passwordInput = page.locator('input[type="password"]');

    await studentIdInput.fill('CK-2026-101');
    await passwordInput.fill('PASS101');
    await page.getByRole('button', { name: /Validate Credentials/i }).click();

    // 3. PIN Verification Screen
    await expect(page.getByText(/Identity Confirmed/i)).toBeVisible();
    await expect(page.getByText(/Aarav Sharma/i)).toBeVisible();

    // Auto-fill PIN: 1234
    const autoFillBtn = page.getByRole('button', { name: /Auto-Fill \(1234\)/i });
    if (await autoFillBtn.isVisible()) {
      await autoFillBtn.click();
    } else {
      await page.getByRole('button', { name: '1', exact: true }).click();
      await page.getByRole('button', { name: '2', exact: true }).click();
      await page.getByRole('button', { name: '3', exact: true }).click();
      await page.getByRole('button', { name: '4', exact: true }).click();
    }
    await page.getByRole('button', { name: /Verify PIN & Enter Dashboard/i }).click();

    // 4. Student Dashboard / Home Screen
    await expect(page.getByText(/Aarav Sharma/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Intermediate Second Year/i)).toBeVisible();

    // Click Add on first available product
    const addBtn = page.locator('button:has-text("Add")').first();
    await expect(addBtn).toBeVisible({ timeout: 10000 });
    await addBtn.click();

    // Wait for the cart indicator to update and navigate to cart
    const cartTab = page.locator('button:has-text("Cart")').first();
    await expect(cartTab).toBeVisible({ timeout: 10000 });
    await cartTab.click();

    // 5. Shopping Cart Screen
    await expect(page.getByRole('heading', { name: /Your CampusKart Shopping Bag/i })).toBeVisible();
    await expect(page.getByText(/Cart Summary/i)).toBeVisible();

    await page.waitForTimeout(600);
    await page.getByRole('button', { name: /Proceed to Checkout/i }).click();

    // 6. Order Review Screen
    await expect(page.getByRole('heading', { name: /Order Review & Fulfilment/i })).toBeVisible();
    await expect(page.getByText(/Campus Kiosk Pickup/i).first()).toBeVisible();

    await page.waitForTimeout(600);
    await page.getByRole('button', { name: /Continue to Payment/i }).click();

    // 7. Payment Method Screen
    await expect(page.getByRole('heading', { name: /Select Payment Method/i })).toBeVisible();
    await expect(page.getByText(/CampusKart Student Wallet \(Default\)/i)).toBeVisible();

    await page.waitForTimeout(600);
    await page.getByRole('button', { name: /Proceed to Wallet Verification/i }).click();

    // 8. Wallet Verification Screen
    await expect(page.getByRole('heading', { name: /Wallet Balance Verification/i })).toBeVisible();
    await page.waitForTimeout(600);
    await page.locator('button:has-text("Confirm and Pay")').click();

    // 9. Payment Processing Screen (5-second simulated payment sequence)
    await expect(page.getByText(/Simulated Prototype Payment Engine/i)).toBeVisible();

    // 10. Order Confirmation Screen
    await expect(page.getByRole('heading', { name: /Order Confirmed!/i })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/Simulated Wallet Debit Complete/i)).toBeVisible();
    await expect(page.getByText(/Aarav Sharma/i)).toBeVisible();

    // 11. View Official Live Receipt
    const viewReceiptBtn = page.getByRole('button', { name: /View Receipt/i });
    await expect(viewReceiptBtn).toBeVisible();
    await viewReceiptBtn.click();

    // Receipt Modal should be visible
    await expect(page.getByText('Official CampusKart Receipt')).toBeVisible();
    await expect(page.getByRole('button', { name: '✕' })).toBeVisible();
  });
});
