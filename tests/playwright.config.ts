import { defineConfig, devices } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '..')

// Determine which test suite to run based on environment
const TEST_SUITE = process.env.TEST_SUITE || 'hackernews'

// App configurations
const appConfigs = {
  hackernews: {
    testMatch: ['**/hackernews*.spec.ts', '**/router.spec.ts', '**/accessibility.spec.ts'],
    baseURL: 'http://localhost:5173',
    command: `cd ${path.join(PROJECT_ROOT, 'apps/hackernews')} && npm run dev -- --port 5173 --strictPort`,
  },
  primitives: {
    testMatch: ['**/primitives.spec.ts'],
    baseURL: 'http://localhost:5174',
    command: `cd ${path.join(PROJECT_ROOT, 'tests/fixtures/primitives-app')} && npm run dev`,
  },
  // Templates are tested against built versions or specific ports
  'vite-starter': {
    testMatch: ['**/templates/vite-starter.spec.ts'],
    baseURL: 'http://localhost:5175',
    command: `cd ${path.join(PROJECT_ROOT, 'packages/create-flexium/templates/vite-starter')} && npm run dev -- --port 5175 --strictPort`,
  },
  'pwa-starter': {
    testMatch: ['**/templates/pwa-starter.spec.ts'],
    baseURL: 'http://localhost:5176',
    command: `cd ${path.join(PROJECT_ROOT, 'packages/create-flexium/templates/pwa-starter')} && npm run dev -- --port 5176 --strictPort`,
  },
  // Run all tests (CI mode)
  all: {
    testMatch: ['**/*.spec.ts'],
    baseURL: 'http://localhost:5173',
    command: `cd ${path.join(PROJECT_ROOT, 'apps/hackernews')} && npm run dev -- --port 5173 --strictPort`,
  },
}

const currentConfig = appConfigs[TEST_SUITE] || appConfigs.hackernews

// Browser configurations for different test levels
const browserProjects = {
  // Quick tests - chromium only
  quick: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Standard tests - major browsers
  standard: [
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
  // Full tests - all browsers including mobile
  full: [
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
    {
      name: 'edge',
      use: { ...devices['Desktop Edge'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
}

const browserLevel = (process.env.BROWSER_LEVEL || 'standard') as keyof typeof browserProjects

/**
 * Flexium E2E Test Configuration
 *
 * Usage:
 *   # Run hackernews tests (default)
 *   npm run test:e2e
 *
 *   # Run primitives tests
 *   TEST_SUITE=primitives npm run test:e2e
 *
 *   # Run all tests with full browser matrix
 *   TEST_SUITE=all BROWSER_LEVEL=full npm run test:e2e
 *
 *   # Quick test on chromium only
 *   BROWSER_LEVEL=quick npm run test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: currentConfig.testMatch,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: './test-results/html-report' }],
    ['list'],
    ...(process.env.CI ? [['github' as const]] : []),
  ],

  use: {
    baseURL: currentConfig.baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Increase timeout for animations
    actionTimeout: 10000,
  },

  /* Output folder for test artifacts */
  outputDir: './test-results',

  /* Expect configuration */
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
    },
  },

  projects: browserProjects[browserLevel],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: currentConfig.command,
    url: currentConfig.baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  /* Global setup/teardown */
  globalSetup: process.env.GLOBAL_SETUP ? './global-setup.ts' : undefined,
  globalTeardown: process.env.GLOBAL_TEARDOWN ? './global-teardown.ts' : undefined,
})
