import { test, expect } from '@playwright/test';

test.describe('Basic Layout', () => {
  test('has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Markdown Editor/);
  });

  test('displays header with app title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Markdown Editor');
  });

  test('shows sidebar area', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('aside')).toBeVisible();
  });

  test('shows main content area', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
  });

  test('shows empty state message when no file is open', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('No file open')).toBeVisible();
    await expect(page.getByText('Open a folder to get started')).toBeVisible();
  });

  test('has settings button in header', async ({ page }) => {
    await page.goto('/');
    const settingsButton = page.locator('button[title*="Settings"]');
    await expect(settingsButton).toBeVisible();
  });
});
