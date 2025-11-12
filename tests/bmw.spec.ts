import { test, expect } from './test-setup';
import { TestHelper } from './helpers/test-helper';

test.describe('BMW.ro Website Tests', () => {
  let helper: TestHelper;

  test.beforeEach(async ({ page }) => {
    helper = new TestHelper(page);
    await page.goto('/');
    // Accept cookies if present
    try {
      await helper.clickWithContext('[data-test="cookie-accept"]', 'Accept cookies button');
    } catch (e) {
      // Cookie banner might not be present
      console.log('No cookie banner found');
    }
    // Take initial screenshot
    await helper.takeScreenshotWithContext('page-load');
  });

  test('homepage loads correctly', async ({ page }) => {
    // Wait for the page to load and log state
    await page.waitForLoadState('networkidle');
    const pageState = await helper.getPageState();
    console.log('Page state after load:', pageState);

    // Verify the BMW logo is visible
    await helper.expectWithContext(
      expect(page.locator('[data-test="bmw-logo"]')).toBeVisible({ timeout: 10000 }),
      'BMW logo should be visible on homepage'
    );

    // Verify the main navigation is present
    await helper.expectWithContext(
      expect(page.locator('nav')).toBeVisible({ timeout: 10000 }),
      'Main navigation should be visible'
    );

    // Take screenshot after verification
    await helper.takeScreenshotWithContext('homepage-verified');
  });

  test('search functionality works', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    // Click on search icon
    await page.locator('[data-test="search-button"]').click();
    // Type search query
    await page.locator('[data-test="search-input"]').fill('BMW X5');
    // Wait for search results
    await expect(page.locator('[data-test="search-results"]')).toBeVisible({ timeout: 10000 });
    // Verify search results contain relevant content
    await expect(page.locator('[data-test="search-results"]')).toContainText('X5');
  });

  test('vehicle configurator navigation', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    // Navigate to vehicle configurator
    await page.locator('a[href*="configurator"]').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('a[href*="configurator"]').first().click();
    // Wait for navigation
    await page.waitForURL(/.*configurator.*/, { timeout: 10000 });
    // Verify configurator content is present
    await expect(page.locator('.bmw-configurator-content')).toBeVisible({ timeout: 10000 });
  });

  test('book a test drive flow', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    // Find and click on test drive button
    await page.locator('a[href*="test-drive"]').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('a[href*="test-drive"]').first().click();
    // Wait for form to load
    await page.waitForURL(/.*test-drive.*/, { timeout: 10000 });
    // Verify test drive form is present
    await expect(page.locator('form[data-test="test-drive-form"]')).toBeVisible({ timeout: 10000 });
    // Verify required fields are present
    await expect(page.locator('[data-test="first-name-input"]')).toBeVisible();
    await expect(page.locator('[data-test="last-name-input"]')).toBeVisible();
    await expect(page.locator('[data-test="email-input"]')).toBeVisible();
  });

  test('dealer locator functionality', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    // Navigate to dealer locator
    await page.locator('a[href*="dealer-locator"]').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('a[href*="dealer-locator"]').first().click();
    // Wait for page to load
    await page.waitForURL(/.*dealer-locator.*/, { timeout: 10000 });
    // Verify search input is present (using a more specific selector)
    await expect(page.locator('[data-test="dealer-search-input"]')).toBeVisible({ timeout: 10000 });
    // Verify map container is present
    await expect(page.locator('[data-test="dealer-map-container"]')).toBeVisible({ timeout: 10000 });
  });
});