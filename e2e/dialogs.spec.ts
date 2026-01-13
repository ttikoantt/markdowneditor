import { test, expect } from '@playwright/test';

test.describe('Dialogs', () => {
  test.describe('Settings Dialog', () => {
    test('can be opened and closed', async ({ page }) => {
      await page.goto('/');

      // Open settings via button
      await page.locator('button[title*="Settings"]').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.locator('#dialog-title')).toContainText('Settings');

      // Close via close button
      await page.getByRole('button', { name: /close/i }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    test('can be closed with Escape key', async ({ page }) => {
      await page.goto('/');

      // Open settings
      await page.locator('button[title*="Settings"]').click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });
  });

  test.describe('Search Dialog', () => {
    test('can be opened via search button', async ({ page }) => {
      await page.goto('/');

      // Click search button in sidebar
      await page.locator('aside button[title="Search"]').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByPlaceholder(/search/i)).toBeVisible();
    });

    test('shows search input field', async ({ page }) => {
      await page.goto('/');

      await page.locator('aside button[title="Search"]').click();
      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toBeEnabled();
    });

    test('can be closed with Escape key', async ({ page }) => {
      await page.goto('/');

      await page.locator('aside button[title="Search"]').click();
      await expect(page.getByRole('dialog')).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });
  });
});

test.describe('Dialog Accessibility', () => {
  test('dialogs have proper role attribute', async ({ page }) => {
    await page.goto('/');

    await page.locator('button[title*="Settings"]').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('role', 'dialog');
  });

  test('dialogs have aria-labelledby for title', async ({ page }) => {
    await page.goto('/');

    await page.locator('button[title*="Settings"]').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
  });

  test('close button has accessible name', async ({ page }) => {
    await page.goto('/');

    await page.locator('button[title*="Settings"]').click();
    const closeButton = page.getByRole('button', { name: /close/i });
    await expect(closeButton).toBeVisible();
  });
});

test.describe('Sidebar Empty State', () => {
  test('shows open folder button when no workspace', async ({ page }) => {
    await page.goto('/');

    const openButton = page.getByRole('button', { name: 'Open Folder' });
    await expect(openButton).toBeVisible();
  });

  test('shows folder icon in empty state', async ({ page }) => {
    await page.goto('/');

    // The FolderOpen icon should be visible in empty state
    await expect(page.locator('aside svg.lucide-folder-open')).toBeVisible();
  });

  test('shows helpful message in empty state', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Open a folder to start editing')).toBeVisible();
  });
});
