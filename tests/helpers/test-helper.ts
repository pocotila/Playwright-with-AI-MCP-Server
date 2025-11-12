import { Page, expect } from '@playwright/test';

export class TestHelper {
  constructor(private page: Page) {}

  async expectWithContext(condition: Promise<void>, context: string): Promise<void> {
    try {
      await condition;
    } catch (error) {
      const errorMessage = `Failed: ${context}\nOriginal error: ${error.message}`;
      throw new Error(errorMessage);
    }
  }

  async waitForElementWithContext(selector: string, context: string): Promise<void> {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
    } catch (error) {
      const errorMessage = `Failed to find element "${selector}" for ${context}\nOriginal error: ${error.message}`;
      throw new Error(errorMessage);
    }
  }

  async clickWithContext(selector: string, context: string): Promise<void> {
    try {
      await this.waitForElementWithContext(selector, context);
      await this.page.click(selector);
    } catch (error) {
      const errorMessage = `Failed to click "${selector}" for ${context}\nOriginal error: ${error.message}`;
      throw new Error(errorMessage);
    }
  }

  async fillWithContext(selector: string, value: string, context: string): Promise<void> {
    try {
      await this.waitForElementWithContext(selector, context);
      await this.page.fill(selector, value);
    } catch (error) {
      const errorMessage = `Failed to fill "${selector}" with "${value}" for ${context}\nOriginal error: ${error.message}`;
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
    } catch (error) {
      const errorMessage = `Failed to verify text in "${selector}" for ${context}\nOriginal error: ${error.message}`;
      throw new Error(errorMessage);
    }
  }

  async takeScreenshotWithContext(name: string): Promise<void> {
    try {
      await this.page.screenshot({
        path: `./test-results/screenshots/${name}-${Date.now()}.png`,
        fullPage: true
      });
    } catch (error) {
      console.error(`Failed to take screenshot "${name}": ${error.message}`);
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
}