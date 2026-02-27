// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',

  // Run tests in parallel — each test gets an isolated browser context with
  // its own localStorage, so there's no shared state to worry about.
  fullyParallel: true,

  // Fail the build on CI if test.only was accidentally committed.
  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 1 : 0,
  reporter: 'list',

  use: {
    baseURL: 'http://127.0.0.1:3333',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'node serve.js',
    url: 'http://127.0.0.1:3333',
    // Re-use an already-running server during local dev, always fresh on CI.
    reuseExistingServer: !process.env.CI,
  },
});
