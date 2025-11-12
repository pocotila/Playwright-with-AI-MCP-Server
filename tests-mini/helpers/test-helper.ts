import { Page, expect } from '@playwright/test';

export class TestHelper {
  constructor(private page: Page) {}

  async expectWithContext(condition: Promise<void>, context: string): Promise<void> {
    try {
      await condition;
    } catch (err: unknown) {
      const errorMessage = `Failed: ${context}\nOriginal error: ${err instanceof Error ? err.message : String(err)}`;
      throw new Error(errorMessage);
    }
  }

  async waitForElementWithContext(selector: string, context: string): Promise<void> {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
    } catch (err: unknown) {
      const errorMessage = `Failed to find element "${selector}" for ${context}\nOriginal error: ${err instanceof Error ? err.message : String(err)}`;
      throw new Error(errorMessage);
    }
  }

  async clickWithContext(selector: string, context: string): Promise<void> {
    try {
      await this.waitForElementWithContext(selector, context);
      await this.page.click(selector);
    } catch (err: unknown) {
      const errorMessage = `Failed to click "${selector}" for ${context}\nOriginal error: ${err instanceof Error ? err.message : String(err)}`;
      throw new Error(errorMessage);
    }
  }

  async fillWithContext(selector: string, value: string, context: string): Promise<void> {
    try {
      await this.waitForElementWithContext(selector, context);
      await this.page.fill(selector, value);
    } catch (err: unknown) {
      const errorMessage = `Failed to fill "${selector}" with "${value}" for ${context}\nOriginal error: ${err instanceof Error ? err.message : String(err)}`;
      throw new Error(errorMessage);
    }
  }

  async verifyElementText(selector: string, expectedText: string, context: string): Promise<void> {
    try {
      await this.waitForElementWithContext(selector, context);
      const actualText = await this.page.textContent(selector);
      if (!actualText?.includes(expectedText)) {
        throw new Error(`Expected text "${expectedText}" not found in element. Found: "${actualText}"`);
      }
    } catch (err: unknown) {
      const errorMessage = `Failed to verify text in "${selector}" for ${context}\nOriginal error: ${err instanceof Error ? err.message : String(err)}`;
      throw new Error(errorMessage);
    }
  }

  async takeScreenshotWithContext(name: string): Promise<void> {
    try {
      await this.page.screenshot({
        path: `./test-results/screenshots/${name}-${Date.now()}.png`,
        fullPage: true
      });
    } catch (err: unknown) {
      console.error(`Failed to take screenshot "${name}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async getPageState(): Promise<object> {
    return await this.page.evaluate(() => ({
      url: window.location.href,
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      devicePixelRatio: window.devicePixelRatio,
      documentTitle: document.title,
      documentReadyState: document.readyState
    }));
  }

  async findFirstVisibleSelector(selectors: string[], timeout: number = 10000): Promise<string | null> {
    for (const selector of selectors) {
      try {
        if (await this.page.locator(selector).isVisible({ timeout }).catch(() => false)) {
          return selector;
        }
      } catch (err: unknown) {
        // Selector not found; continue to next
      }
    }
    return null;
  }

  async clickFirstVisible(selectors: string[], context: string): Promise<void> {
    for (const selector of selectors) {
      try {
        const locator = this.page.locator(selector).first();
        if (await locator.isVisible({ timeout: 5000 }).catch(() => false)) {
          await locator.click();
          return;
        }
      } catch (err: unknown) {
        // Selector not found; continue to next
      }
    }
    throw new Error(`Failed to click any of the provided selectors for ${context}`);
  }

  async fillFirstVisible(selectors: string[], value: string, context: string): Promise<void> {
    for (const selector of selectors) {
      try {
        const locator = this.page.locator(selector).first();
        if (await locator.isVisible({ timeout: 5000 }).catch(() => false)) {
          await locator.fill(value);
          return;
        }
      } catch (err: unknown) {
        // Selector not found; continue to next
      }
    }
    throw new Error(`Failed to fill any of the provided selectors for ${context}`);
  }

  // Try multiple selectors and return the first one that is visible within timeout
  async findFirstVisibleSelector(selectors: string[], timeout: number = 10000): Promise<string | null> {
    for (const selector of selectors) {
      try {
        const locator = this.page.locator(selector).first();
        const visible = await locator.isVisible({ timeout });
        if (visible) return selector;
      } catch (err) {
        // ignore and try next
      }
    }
    return null;
  }

  async clickFirstVisible(selectors: string[], context: string): Promise<void> {
    const sel = await this.findFirstVisibleSelector(selectors);
    if (!sel) throw new Error(`None of selectors [${selectors.join(', ')}] were visible for ${context}`);
    await this.clickWithContext(sel, context);
  }

  async fillFirstVisible(selectors: string[], value: string, context: string): Promise<void> {
    const sel = await this.findFirstVisibleSelector(selectors);
    if (!sel) throw new Error(`None of selectors [${selectors.join(', ')}] were visible for ${context}`);
    await this.fillWithContext(sel, value, context);
  }
}
