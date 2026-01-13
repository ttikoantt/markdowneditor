import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
  test('opens settings with keyboard shortcut', async ({ page, browserName }) => {
    // Skip on webkit as keyboard shortcuts work differently
    test.skip(browserName === 'webkit', 'Keyboard shortcuts differ on webkit');

    await page.goto('/');

    // Use a keyboard event dispatch since Playwright's keyboard.press has issues with comma
    await page.evaluate(() => {
      const event = new KeyboardEvent('keydown', {
        key: ',',
        metaKey: true,
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#dialog-title')).toContainText('Settings');
  });

  test('opens search with Cmd+Shift+F / Ctrl+Shift+F', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Keyboard shortcuts differ on webkit');

    await page.goto('/');

    // Use a keyboard event dispatch for cross-platform compatibility
    await page.evaluate(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        shiftKey: true,
        metaKey: true,
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('closes dialog with Escape key', async ({ page }) => {
    await page.goto('/');

    // Open settings first
    await page.locator('button[title*="Settings"]').click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
