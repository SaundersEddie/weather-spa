import { test, expect } from '@playwright/test';

test('two panels can fetch weather independently', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Home panel
  await page.getByTestId('panel-home').getByLabel('ZIP').fill('10001');
  await page
    .getByTestId('panel-home')
    .getByRole('button', { name: 'Get Weather' })
    .click();
  await expect(page.getByTestId('panel-home')).toContainText('Mock City');

  // Destination panel
  await page.getByTestId('panel-destination').getByLabel('ZIP').fill('90210');
  await page
    .getByTestId('panel-destination')
    .getByRole('button', { name: 'Get Weather' })
    .click();
  await expect(page.getByTestId('panel-destination')).toContainText(
    'Mock City',
  );
});
