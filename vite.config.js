import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import fs from 'fs'

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url)));

export default defineConfig({
  // Allow overriding base path for GitHub Pages
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    ...(process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT ? [
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        // Keep defaults; source maps upload only if env exists
      })
    ] : [])
  ],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    ],
    exclude: [
      'tests/**', // exclude Playwright e2e
      'e2e/**',
      'node_modules/**',
      'dist/**',
    ],
  }
})
