Testing and Smoke E2E

Playwright (optional) can run a quick smoke covering add → delete → undo and a mobile viewport snapshot.

- Install: npx playwright install
- Run dev: npm run dev
- In another terminal: npx playwright test

Trigger a test crash

- Temporarily throw in any component render, e.g. inside Dashboard: throw new Error('test crash')
- The app shows the CrashScreen and Sentry logs the error if VITE_SENTRY_DSN is configured.

