import { test, expect } from '@playwright/test';

test.describe('Sidebar', () => {
  test('displays sidebar with workspace name placeholder', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.getByText('No Folder Open')).toBeVisible();
  });

  test('shows open folder button in empty state', async ({ page }) => {
    await page.goto('/');
    const openButton = page.getByRole('button', { name: 'Open Folder' });
    await expect(openButton).toBeVisible();
  });

  test('shows search button in sidebar header', async ({ page }) => {
    await page.goto('/');
    const searchButton = page.locator('aside button[title="Search"]');
    await expect(searchButton).toBeVisible();
  });

  test('has proper sidebar width', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('aside');
    const box = await sidebar.boundingBox();
    expect(box?.width).toBeGreaterThan(100);
    expect(box?.width).toBeLessThan(400);
  });

  test('shows open folder message when no workspace', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Open a folder to start editing')).toBeVisible();
  });
});
