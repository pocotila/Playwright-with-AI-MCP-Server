import { Reporter, TestCase, TestResult, TestStep, TestError, FullConfig } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

class CustomReporter implements Reporter {
  private config: FullConfig | undefined;

  onBegin(config: FullConfig) {
    this.config = config;
    console.log('\nStarting the test run with', config.projects.length, 'projects');
  }
  onTestBegin(test: TestCase) {
    console.log(`\nStarting test: ${test.title}`);
    console.log(`Browser: ${test.parent.project().name}`);
  }

  onStepBegin(test: TestCase, result: TestResult, step: TestStep) {
    if (step.category === 'test.step') {
      console.log(`  Step: ${step.title}`);
    }
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep) {
    if (step.error) {
      console.log(`  Step failed: ${step.title}`);
      console.log(`  Error: ${step.error.message}`);
    }
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    console.log(`\nTest: ${test.title}`);
    console.log(`Status: ${result.status}`);
    console.log(`Duration: ${result.duration}ms`);

    if (result.status === 'failed') {
      console.log('\nFailure details:');
      if (result.error) {
        this.logError(result.error);
      }

      // Log screenshot location if available
      const screenshotPath = this.getAttachment(result, 'screenshot');
      if (screenshotPath) {
        console.log(`Screenshot: ${screenshotPath}`);
      }

      // Log video if available
      const videoPath = result.video?.path();
      if (videoPath) {
        console.log(`Video: ${videoPath}`);
      }

      // Log trace if available
      const tracePath = result.trace?.path();
      if (tracePath) {
        console.log(`Trace: ${tracePath}`);
      }
    }
  }

  async onEnd(result: { status: 'passed' | 'failed' | 'timedout' | 'interrupted' }) {
    const summaryPath = path.join(this.config?.outputDir || '', 'test-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(result, null, 2));
    console.log(`\nTest run completed with status: ${result.status}`);
  }

  private logError(error: TestError) {
    console.log('Error message:', error.message);
    if (error.stack) {
      console.log('Stack trace:', error.stack);
    }
    if (error.value) {
      console.log('Additional error info:', error.value);
    }
    if (error.snippet) {
      console.log('Code snippet:', error.snippet);
    }
  }

  private getAttachment(result: TestResult, attachmentType: string): string | undefined {
    const attachment = result.attachments.find(a => a.name === attachmentType);
    return attachment?.path;
  }
}
export default CustomReporter;