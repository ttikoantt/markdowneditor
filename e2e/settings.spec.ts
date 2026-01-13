import { test, expect } from '@playwright/test';

test.describe('Settings Dialog', () => {
  test('opens settings dialog when clicking settings button', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[title*="Settings"]').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('#dialog-title')).toContainText('Settings');
  });

  test('closes settings dialog when clicking close button', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[title*="Settings"]').click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.locator('button[aria-label="Close dialog"]').click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('shows theme options in select dropdown', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[title*="Settings"]').click();

    await expect(page.getByText('Theme')).toBeVisible();
    const themeSelect = page.locator('select').first();
    await expect(themeSelect).toBeVisible();
    await expect(themeSelect).toContainText('System');
    await expect(themeSelect).toContainText('Light');
    await expect(themeSelect).toContainText('Dark');
  });

  test('shows font size setting', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[title*="Settings"]').click();

    await expect(page.getByText('Font Size')).toBeVisible();
    const fontSizeInput = page.locator('input[type="number"]').first();
    await expect(fontSizeInput).toBeVisible();
  });

  test('shows auto-save section', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[title*="Settings"]').click();

    // Auto Save is the heading
    await expect(page.getByRole('heading', { name: 'Auto Save' })).toBeVisible();
    await expect(page.getByText('Enable Auto Save')).toBeVisible();
  });
});
