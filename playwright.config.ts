import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: process.env.PW_BASE_URL || 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});

