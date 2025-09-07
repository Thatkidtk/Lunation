import { test, expect } from '@playwright/test';

test('app renders without ErrorBoundary crash', async ({ page }) => {
  await page.addInitScript(() => {
    try { localStorage.setItem('lunation-onboarding-completed', 'true'); } catch {}
  });
  await page.goto('/');
  const hasCrash = await page.getByText('Something went wrong').isVisible().catch(() => false);
  if (hasCrash) {
    const eventId = await page.getByText(/Error id:/).textContent().catch(() => '');
    test.info().annotations.push({ type: 'sentry', description: eventId || '' });
  }
  // Debug: list visible button names to understand nav rendering
  const buttons = await page.getByRole('button').allInnerTexts();
  console.log('Buttons on page:', buttons);
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body text snippet:', bodyText.slice(0, 200));
  expect(hasCrash, 'CrashScreen should not be visible').toBeFalsy();
});
