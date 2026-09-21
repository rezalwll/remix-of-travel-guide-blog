import { defineConfig, devices } from '@playwright/test';

const external = process.env.E2E_EXTERNAL === 'true';

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list']],
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173', ignoreHTTPSErrors: true, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }, { name: 'mobile', use: { ...devices['Pixel 7'] } }],
  webServer: external ? undefined : [
    { command: 'npm run start:api', url: 'http://127.0.0.1:8787/health/ready', reuseExistingServer: !process.env.CI, timeout: 120_000 },
    { command: 'npm run preview', url: 'http://127.0.0.1:4173/healthz', reuseExistingServer: !process.env.CI, timeout: 120_000 },
  ],
});
