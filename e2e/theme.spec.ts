import { test, expect } from '@playwright/test';

test.describe('Theme', () => {
  test('can switch to dark theme via select', async ({ page }) => {
    await page.goto('/');

    // Open settings
    await page.locator('button[title*="Settings"]').click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Select dark theme from dropdown
    const themeSelect = page.locator('select').first();
    await themeSelect.selectOption('dark');

    // Close dialog
    await page.locator('button[aria-label="Close dialog"]').click();

    // Check that dark class is applied
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
  });

  test('can switch to light theme via select', async ({ page }) => {
    await page.goto('/');

    // Open settings
    await page.locator('button[title*="Settings"]').click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Select light theme from dropdown
    const themeSelect = page.locator('select').first();
    await themeSelect.selectOption('light');

    // Close dialog
    await page.locator('button[aria-label="Close dialog"]').click();

    // Check that dark class is not present
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);
  });

  test('dark theme persists after reload', async ({ page }) => {
    await page.goto('/');

    // Set dark theme
    await page.locator('button[title*="Settings"]').click();
    await page.locator('select').first().selectOption('dark');
    await page.locator('button[aria-label="Close dialog"]').click();

    // Reload page
    await page.reload();

    // Check theme is still dark
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
  });
});
