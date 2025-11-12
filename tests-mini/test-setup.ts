import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Navigate to base URL
    await page.goto('/');
    // Optionally dismiss cookie banner if present (non-blocking)
    try {
      const cookieButton = page.locator('button:has-text("Accept"), button:has-text("accept"), [data-test*="cookie"], [id*="cookie"]').first();
      if (await cookieButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cookieButton.click().catch(() => {});
      }
    } catch (e) {
      // Cookie banner not found or dismissal failed; proceed anyway
    }
    await use(page);
  },
});

export { expect } from '@playwright/test';
