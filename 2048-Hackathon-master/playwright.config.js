// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',

  // Run all tests in parallel within a file
  fullyParallel: true,

  // Fail the build on CI if test.only is accidentally committed
  forbidOnly: !!process.env.CI,

  // No retries locally; 2 on CI to handle flakiness
  retries: process.env.CI ? 2 : 0,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    // Serve the game directly from the filesystem
    baseURL: 'file://' + require('path').resolve(__dirname, 'index.html'),

    // Capture traces on first retry so failures are debuggable
    trace: 'on-first-retry',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
