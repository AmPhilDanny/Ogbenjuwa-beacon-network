// ─── Smoke Test: All apps load ─────────────────────────────────────────
import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('Admin loads and shows login', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Login').or(page.locator('input[type="email"]'))).toBeVisible({ timeout: 10000 });
  });

  test('Beacon-network landing page loads', async ({ page, baseURL }) => {
    // Override baseURL for beacon
    await page.goto('http://localhost:3000/');
    await expect(page.locator('h1, h2, .hero-title')).toBeVisible({ timeout: 10000 });
  });

  test('Citizen portal login loads', async ({ page, baseURL }) => {
    await page.goto('http://localhost:3001/login');
    await expect(page.locator('text=Login, text=Phone, input[type="tel"]').first()).toBeVisible({ timeout: 10000 });
  });
});
