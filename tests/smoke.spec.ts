import { test, expect } from '@playwright/test';

test.describe('Lunation smoke', () => {
  test('add → delete → undo medication (mobile)', async ({ page }) => {
    // Skip onboarding modal to avoid overlay intercepts
    await page.addInitScript(() => {
      try { localStorage.setItem('lunation-onboarding-completed', 'true'); } catch {}
    });
    await page.goto('/');

    // Navigate to Medications tab
    await page.getByRole('button', { name: 'Medications' }).click();

    // Open form and add one
    await page.getByTestId('add-medication-toggle').click();
    await page.getByTestId('medication-name-input').fill('PlaywrightTest');
    await page.getByTestId('submit-add-medication').click();

    // assert present (card heading)
    await expect(page.getByRole('heading', { name: 'PlaywrightTest' })).toBeVisible();

    // Delete the specific card
    const card = page.getByTestId(/medication-card-/).filter({ hasText: 'PlaywrightTest' });
    await card.getByRole('button', { name: /delete/i }).click();

    // Undo via toast button
    await page.getByRole('button', { name: 'Undo' }).click();

    // Restored
    await expect(page.getByRole('heading', { name: 'PlaywrightTest' })).toBeVisible();
  });
});
