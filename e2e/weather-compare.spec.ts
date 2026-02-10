import { test, expect } from '@playwright/test';

test('two panels can fetch weather independently (mocked)', async ({
  page,
}) => {
  // --- Mock Open-Meteo Geocoding ---
  await page.route(
    'https://geocoding-api.open-meteo.com/v1/search**',
    async (route) => {
      const url = new URL(route.request().url());
      const zip = url.searchParams.get('name') ?? '';

      // Return different cities for different ZIPs so we prove panels are independent
      const geo =
        zip === '10001'
          ? {
              results: [
                {
                  id: 1,
                  name: 'Mock City',
                  latitude: 40.7128,
                  longitude: -74.006,
                  country: 'US',
                  admin1: 'NY',
                },
              ],
            }
          : zip === '90210'
            ? {
                results: [
                  {
                    id: 2,
                    name: 'Mock Hills',
                    latitude: 34.0901,
                    longitude: -118.4065,
                    country: 'US',
                    admin1: 'CA',
                  },
                ],
              }
            : { results: [] };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(geo),
      });
    },
  );

  // --- Mock Open-Meteo Forecast ---
  await page.route(
    'https://api.open-meteo.com/v1/forecast**',
    async (route) => {
      const url = new URL(route.request().url());
      const lat = url.searchParams.get('latitude');

      // Make temps differ by panel (lat check is enough)
      const isHome = lat === '40.7128';

      const hourlyTimes = Array.from(
        { length: 24 },
        (_, i) => `2026-02-10T${String(i).padStart(2, '0')}:00`,
      );
      const dailyTimes = Array.from(
        { length: 7 },
        (_, i) => `2026-02-${String(10 + i).padStart(2, '0')}`,
      );

      const payload = {
        timezone: 'America/New_York',
        current: {
          time: '2026-02-10T09:00',
          temperature_2m: isHome ? 42.1 : 70.3,
          apparent_temperature: isHome ? 39.5 : 71.0,
          weather_code: isHome ? 2 : 0,
          wind_speed_10m: isHome ? 10.2 : 5.1,
        },
        hourly: {
          time: hourlyTimes,
          temperature_2m: Array.from({ length: 24 }, (_, i) =>
            isHome ? 40 + i * 0.2 : 68 + i * 0.1,
          ),
          precipitation_probability: Array.from({ length: 24 }, () =>
            isHome ? 10 : 0,
          ),
          weather_code: Array.from({ length: 24 }, () => (isHome ? 2 : 0)),
        },
        daily: {
          time: dailyTimes,
          temperature_2m_max: isHome
            ? [45, 46, 44, 43, 41, 42, 40]
            : [75, 76, 77, 76, 75, 74, 73],
          temperature_2m_min: isHome
            ? [32, 33, 31, 30, 28, 29, 27]
            : [60, 61, 62, 61, 60, 59, 58],
          weather_code: isHome
            ? [2, 3, 1, 61, 2, 45, 0]
            : [0, 1, 2, 0, 1, 2, 0],
        },
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload),
      });
    },
  );

  await page.goto('http://localhost:5173');

  // Home panel
  await page.getByTestId('panel-home').getByLabel('ZIP').fill('10001');
  await page
    .getByTestId('panel-home')
    .getByRole('button', { name: 'Get Weather' })
    .click();
  await expect(page.getByTestId('panel-home')).toContainText('Mock City');
  await expect(page.getByTestId('panel-home')).toContainText('Next 24 Hours');
  await expect(page.getByTestId('panel-home')).toContainText('7-Day');

  // Destination panel
  await page.getByTestId('panel-destination').getByLabel('ZIP').fill('90210');
  await page
    .getByTestId('panel-destination')
    .getByRole('button', { name: 'Get Weather' })
    .click();
  await expect(page.getByTestId('panel-destination')).toContainText(
    'Mock Hills',
  );

  // Bonus: prove temps differ (panels truly independent)
  await expect(page.getByTestId('panel-home')).toContainText('42');
  await expect(page.getByTestId('panel-destination')).toContainText('70');
});
