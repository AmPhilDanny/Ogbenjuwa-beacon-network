// ─── Auth Flow Tests ───────────────────────────────────────────────────
import { test, expect } from '@playwright/test';

const TEST_USER = { phone: '+2348034412290', otp: '123456' };

test.describe('Authentication', () => {
  test('Beacon-network login flow', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('input[type="tel"], input[id*="phone"], input[placeholder*="phone"]', { timeout: 10000 });

    // Fill phone
    const phoneInput = page.locator('input[type="tel"], input[id*="phone"], input[placeholder*="phone"]').first();
    await phoneInput.fill(TEST_USER.phone);

    // Fill OTP
    const otpInput = page.locator('input[type="text"][inputmode="numeric"], input[id*="otp"], input[placeholder*="OTP"]').first();
    if (await otpInput.isVisible()) {
      await otpInput.fill(TEST_USER.otp);
    }

    // Click login/submit
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first().click();

    // Should redirect to home/dashboard
    await expect(page).toHaveURL(/home|dashboard|feed/, { timeout: 15000 });
  });

  test('Citizen portal login flow', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    await page.waitForSelector('input[type="tel"], input[id*="phone"]', { timeout: 10000 });

    const phoneInput = page.locator('input[type="tel"], input[id*="phone"]').first();
    await phoneInput.fill(TEST_USER.phone);

    const otpInput = page.locator('input[type="text"][inputmode="numeric"], input[id*="otp"]').first();
    if (await otpInput.isVisible()) {
      await otpInput.fill(TEST_USER.otp);
    }

    await page.locator('button[type="submit"], button:has-text("Login")').first().click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  });
});
