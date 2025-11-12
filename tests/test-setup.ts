import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Accept cookies by default
    await page.goto('/');
    try {
      await page.getByRole('button', { name: /accept/i }).click();
    } catch (e) {
      // Cookie banner might not be present
    }
    await use(page);
  },
});

export { expect } from '@playwright/test';