import { test, expect } from '@playwright/test';

test.describe('Lunation smoke', () => {
  test('add → delete → undo medication (mobile)', async ({ page }) => {
    await page.goto('/');

    // Navigate to Medications tab
    await page.getByRole('button', { name: 'Medications' }).click();

    // Open form and add one
    await page.getByTestId('add-medication-toggle').click();
    await page.getByTestId('medication-name-input').fill('PlaywrightTest');
    await page.getByTestId('submit-add-medication').click();

    // assert present
    await expect(page.getByText('PlaywrightTest')).toBeVisible();

    // Delete the card (click the matching Delete button)
    const deleteBtn = page.getByRole('button', { name: /delete/i }).first();
    await deleteBtn.click();

    // Undo via toast button
    await page.getByRole('button', { name: 'Undo' }).click();

    // Restored
    await expect(page.getByText('PlaywrightTest')).toBeVisible();
  });
});

